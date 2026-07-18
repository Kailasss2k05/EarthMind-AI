DEPENDENCIES = {
    "research": [],
    "sdg": ["research"],
    "policy": ["research"],
    "environmental": ["policy"],
    "finance": ["policy", "environmental"],
    "risk": ["finance"],
    "timeline": ["finance", "risk"],
    "report": []
}

from collections import OrderedDict


def resolve_dependencies(required_agents):
    resolved = []

    def visit(agent):
        for dep in DEPENDENCIES.get(agent, []):
            visit(dep)

        if agent not in resolved:
            resolved.append(agent)

    for agent in required_agents:
        visit(agent)

    resolved.append("report")

    return resolved