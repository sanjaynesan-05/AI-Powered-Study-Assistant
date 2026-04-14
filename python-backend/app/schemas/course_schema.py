from pydantic import BaseModel, Field
from typing import List, Optional

class ResourceSchema(BaseModel):
    type: str = Field(description="'video' or 'article'")
    title: str
    url: str

class SubtopicSchema(BaseModel):
    pass # Wait, subtopics are just list of strings in the prompt schema

class TopicSchema(BaseModel):
    topic_name: str
    difficulty: str
    subtopics: List[str] = Field(min_length=1)
    resources: List[ResourceSchema] = Field(min_length=1)

class ModuleSchema(BaseModel):
    module_title: str
    description: str
    topics: List[TopicSchema] = Field(min_length=1)

class CourseSchema(BaseModel):
    course_name: str
    difficulty: str
    estimated_duration: str
    modules: List[ModuleSchema] = Field(min_length=2)

class QuestionSchema(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    explanation: str
    difficulty: str

class MockTestSchema(BaseModel):
    test_name: str
    questions: List[QuestionSchema] = Field(min_length=5)

class FullLearningResponseSchema(BaseModel):
    course: CourseSchema
    mock_test: MockTestSchema
