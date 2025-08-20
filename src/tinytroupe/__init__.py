# This file makes the tinytroupe directory a Python package.

# For now, let's re-export the key classes from the submodules
# to mimic the structure of the actual library. This might need
# adjustment as I add more files.

# This is a placeholder __init__.py. I will need to populate this
# with the actual content from the TinyTroupe repository.

# Let's start by trying to import the modules that I know I need.
# This will likely fail until I create the files.

try:
    from .agent import TinyPerson
    from .environment import TinyWorld
    from . import config_manager
except ImportError:
    print("TinyTroupe modules not yet available.")

print("!!!!")
print("DISCLAIMER: TinyTroupe relies on Artificial Intelligence (AI) models to generate content.")
print("The AI models are not perfect and may produce inappropriate or inacurate results.")
print("For any serious or consequential use, please review the generated content before using it.")
print("!!!!")
