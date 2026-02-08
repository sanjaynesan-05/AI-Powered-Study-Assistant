"""
Skill Graph Reasoning Agent - Manages skill dependencies and learning paths
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List, Set
import networkx as nx

class SkillGraphAgent:
    """Maintains skill dependency graph and reasons about learning paths"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self._initialize_skill_graph()
    
    def _initialize_skill_graph(self):
        """Create comprehensive skill dependency graph"""
        
        # Programming skills
        skills = {
            "Machine Learning": ["Python", "Statistics", "Linear Algebra"],
            "Deep Learning": ["Machine Learning", "Neural Networks", "Calculus"],
            "Python": ["Programming Basics", "Data Structures"],
            "Data Science": ["Python", "Statistics", "Data Visualization"],
            "Web Development": ["HTML/CSS", "JavaScript", "Backend Basics"],
            "React": ["JavaScript", "HTML/CSS", "Component Thinking"],
            "Node.js": ["JavaScript", "Async Programming"],
            "JavaScript": ["Programming Basics"],
            "Statistics": ["Mathematics Basics", "Probability"],
            "Linear Algebra": ["Mathematics Basics"],
            "Neural Networks": ["Linear Algebra", "Calculus", "Python"],
            # Add more skills as needed
        }
        
        for skill, prerequisites in skills.items():
            self.graph.add_node(skill)
            for prereq in prerequisites:
                self.graph.add_node(prereq)
                self.graph.add_edge(prereq, skill)
    
    async def reason(self, state: AgentState) -> Dict:
        """Reason about what to teach next based on skill graph"""
        
        target_skill = state.get("target_skill", "")
        mastered_skills = set(state.get("mastered_skills", []))
        
        # Find prerequisites
        prerequisites = self._get_prerequisites(target_skill)
        missing = prerequisites - mastered_skills
        
        # Determine next skill
        if missing:
            next_skill = self._find_optimal_next_skill(missing, mastered_skills)
            reason = f"You need to learn {next_skill} before {target_skill}"
        else:
            next_skill = target_skill
            reason = f"You have all prerequisites for {target_skill}. Ready to start!"
        
        # Generate learning path
        learning_path = self._generate_path(target_skill, mastered_skills)
        
        return {
            "current_skill": next_skill,
            "skill_dependencies": self._get_dependency_dict(),
            "skill_gaps": list(missing),
            "learning_path_sequence": learning_path,
            "mastered_skills": list(mastered_skills),
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "skill_graph": {
                    "next_skill": next_skill,
                    "reason": reason,
                    "learning_path": learning_path,
                    "prerequisites_met": len(prerequisites - missing),
                    "prerequisites_total": len(prerequisites),
                    "progress_percentage": (len(prerequisites - missing) / len(prerequisites) * 100) if prerequisites else 100
                }
            },
            "execution_path": [*state.get("execution_path", []), "skill_graph"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Skill Graph: {reason}"
            ]
        }
    
    def _get_prerequisites(self, skill: str) -> Set[str]:
        """Get all prerequisites for a skill (recursive)"""
        if skill not in self.graph:
            return set()
        
        prereqs = set()
        for predecessor in self.graph.predecessors(skill):
            prereqs.add(predecessor)
            prereqs.update(self._get_prerequisites(predecessor))
        
        return prereqs
    
    def _find_optimal_next_skill(self, missing: Set[str], mastered: Set[str]) -> str:
        """Find the best next skill to learn"""
        candidates = []
        for skill in missing:
            skill_prereqs = self._get_prerequisites(skill)
            unmet = skill_prereqs - mastered
            candidates.append((skill, len(unmet)))
        
        candidates.sort(key=lambda x: x[1])
        return candidates[0][0] if candidates else list(missing)[0]
    
    def _generate_path(self, target: str, mastered: Set[str]) -> List[str]:
        """Generate optimal learning path"""
        all_prereqs = self._get_prerequisites(target)
        unlearned = all_prereqs - mastered
        
        subgraph = self.graph.subgraph(unlearned | {target})
        try:
            path = list(nx.topological_sort(subgraph))
            return path
        except nx.NetworkXError:
            return list(unlearned) + [target]
    
    def _get_dependency_dict(self) -> Dict[str, List[str]]:
        """Get dependency dictionary for visualization"""
        return {
            skill: list(self.graph.predecessors(skill))
            for skill in self.graph.nodes()
        }

skill_graph_agent = SkillGraphAgent()
