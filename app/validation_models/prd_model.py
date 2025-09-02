from typing import List, Dict, Optional
from pydantic import BaseModel

class ProductRequirementsDocument(BaseModel):
    product_name: Optional[str]
    status: str
    author: str
    version: str
    last_updated: str
    
    executive_summary: str
    vision: str
    
    problem_statement: str
    user_personas_scenarios: List[Dict[str, str]]
    
    goals_success_metrics: List[Dict[str, str]]
    
    functional_requirements_user_stories: List[Dict[str, str]]
    
    non_functional_requirements: List[str]
    
    release_plan_milestones: List[Dict[str, str]]
    
    out_of_scope: List[str]
    future_work: List[str]
    
    appendix_open_questions: List[Dict[str, str]]