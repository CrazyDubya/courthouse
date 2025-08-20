import asyncio
import websockets
import json
from courtroom_simulation import SimulationController, create_courtroom_agents, load_case

async def handler(websocket, path):
    """
    WebSocket handler for the courtroom simulation.
    """
    print("Client connected.")

    case_file = 'cases/case-001.json'
    case = load_case(case_file)
    agents = create_courtroom_agents(case, llm_provider='openai')

    user_input_queue = asyncio.Queue()

    controller = SimulationController(case, agents, websocket, user_input_queue)

    # Start the simulation in a separate task
    simulation_task = asyncio.create_task(controller.run())

    try:
        async for message in websocket:
            data = json.loads(message)

            if data['event'] == 'set_role':
                role = data['role']
                if role == 'prosecutor':
                    agents['prosecutor'].is_user_controlled = True
                    # Set other roles to not be user controlled
                    agents['defense_lawyer'].is_user_controlled = False
                elif role == 'defense':
                    agents['defense_lawyer'].is_user_controlled = True
                    agents['prosecutor'].is_user_controlled = False
                else: # spectator
                    agents['prosecutor'].is_user_controlled = False
                    agents['defense_lawyer'].is_user_controlled = False
                print(f"User selected role: {role}")

            elif data['event'] == 'user_input':
                await user_input_queue.put(data['message'])

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")
    finally:
        simulation_task.cancel()

async def main():
    """Starts the WebSocket server."""
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server started at ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
