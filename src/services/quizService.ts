export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct answer (0-3)
    explanation?: string;
}

export interface QuizData {
    questions: QuizQuestion[];
    topic: string;
    difficulty: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateQuiz(
    topics: string[],
    difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuizData> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    const topicsText = topics.join(', ');
    const prompt = `Create a 10-question multiple choice quiz on the following topics: ${topicsText}. Difficulty level: ${difficulty}.

Requirements:
- Each question should have exactly 4 answer options (A, B, C, D)
- Only one correct answer per question
- Questions should be appropriate for ${difficulty} difficulty level
- Include a brief explanation for each correct answer
- Format the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Using mini for cost efficiency
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quiz generator. Always return valid JSON only, no markdown, no code blocks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse JSON response
        let quizData: { questions: QuizQuestion[] };
        try {
            // Remove markdown code blocks if present
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            quizData = JSON.parse(cleanedContent);
        } catch (parseError) {
            throw new Error('Failed to parse quiz response. Please try again.');
        }

        // Validate structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== 10) {
            throw new Error('Invalid quiz format. Expected 10 questions.');
        }

        // Validate each question
        for (const q of quizData.questions) {
            if (!q.question || !q.options || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
                throw new Error('Invalid question format.');
            }
        }

        return {
            questions: quizData.questions,
            topic: topicsText,
            difficulty
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate quiz. Please try again.');
    }
}

