import json
from typing import Dict, Any

class Case:
    """A class to represent a legal case."""

    def __init__(self, case_data: Dict[str, Any]):
        self.case_number = case_data.get("case_number")
        self.title = case_data.get("title")
        self.summary = case_data.get("summary")
        self.legal_system = case_data.get("legal_system")
        self.plaintiff = case_data.get("plaintiff")
        self.defendant = case_data.get("defendant")
        self.evidence = case_data.get("evidence", [])
        self.witnesses = case_data.get("witnesses", [])

    def __str__(self):
        return f"Case {self.case_number}: {self.title}"

def load_case(filepath: str) -> Case:
    """
    Loads a case from a JSON file.

    :param filepath: The path to the JSON case file.
    :return: A Case object.
    """
    try:
        with open(filepath, 'r') as f:
            case_data = json.load(f)
        return Case(case_data)
    except FileNotFoundError:
        raise Exception(f"Case file not found at: {filepath}")
    except json.JSONDecodeError:
        raise Exception(f"Error decoding JSON from file: {filepath}")

if __name__ == '__main__':
    # Example usage
    try:
        case = load_case('cases/case-001.json')
        print(f"Successfully loaded case: {case}")
        print(f"Summary: {case.summary}")
        print("Evidence:")
        for item in case.evidence:
            print(f"- {item['title']}: {item['description']}")
    except Exception as e:
        print(e)
