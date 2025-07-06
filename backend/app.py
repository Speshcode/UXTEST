from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
import uuid

app = Flask(__name__)
CORS(app)

# Загружаем данные
with open('./data/matrix.json', encoding='utf-8') as f:
    matrix = json.load(f)

with open('./data/questions.json', encoding='utf-8') as f:
    questions = json.load(f)

# Хранилище активных тестов
active_tests = {}

@app.route('/api/generate-test', methods=['POST'])
def generate_test():
    data = request.json
    user_id = data.get('userId', str(uuid.uuid4()))
    
    # Создаем тест с рандомизацией
    test_questions = []
    
    # Перемешиваем порядок компетенций
    all_competencies = matrix['hardSkills'] + matrix['softSkills']
    random.shuffle(all_competencies)
    
    # Для каждой компетенции берем по одному вопросу из каждого грейда
    for competency in all_competencies:
        if competency in questions:
            competency_questions = []
            
            # Перемешиваем порядок грейдов
            grades = matrix['grades'].copy()
            random.shuffle(grades)
            
            for grade in grades:
                if grade in questions[competency] and questions[competency][grade]:
                    # Выбираем случайный вопрос из доступных для этого грейда
                    question_options = questions[competency][grade]
                    if question_options:
                        selected_question = random.choice(question_options)
                        
                        # Перемешиваем порядок вариантов ответов
                        shuffled_options = selected_question['options'].copy()
                        random.shuffle(shuffled_options)
                        
                        question_data = {
                            'id': f"{competency}_{grade}_{random.randint(1000, 9999)}",
                            'competency': competency,
                            'grade': grade,
                            'text': selected_question['text'],
                            'options': shuffled_options,
                            'correct_answer': selected_question['answer']
                        }
                        competency_questions.append(question_data)
            
            # Перемешиваем вопросы внутри компетенции
            random.shuffle(competency_questions)
            test_questions.extend(competency_questions)
    
    # Сохраняем тест для пользователя
    test_id = str(uuid.uuid4())
    active_tests[test_id] = {
        'userId': user_id,
        'questions': test_questions,
        'startTime': None
    }
    
    # Возвращаем только данные для фронтенда (без правильных ответов)
    frontend_questions = []
    for q in test_questions:
        frontend_questions.append({
            'id': q['id'],
            'competency': q['competency'],
            'grade': q['grade'],
            'text': q['text'],
            'options': q['options']
        })
    
    return jsonify({
        'testId': test_id,
        'userId': user_id,
        'questions': frontend_questions,
        'totalQuestions': len(frontend_questions),
        'hardSkillsCount': len(matrix['hardSkills']),
        'softSkillsCount': len(matrix['softSkills'])
    })

@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    data = request.json
    test_id = data.get('testId')
    user_answers = data.get('answers', {})
    
    if test_id not in active_tests:
        return jsonify({'error': 'Test not found'}), 404
    
    test_data = active_tests[test_id]
    test_questions = test_data['questions']
    
    # Подсчитываем баллы по новому алгоритму
    competency_scores = {}
    
    # Для каждой компетенции подсчитываем баллы
    for competency in matrix['hardSkills'] + matrix['softSkills']:
        competency_questions = [q for q in test_questions if q['competency'] == competency]
        
        if competency_questions:
            total_score = 0
            total_questions = len(competency_questions)
            
            for question in competency_questions:
                question_id = question['id']
                user_answer = user_answers.get(question_id)
                correct_answer = question['correct_answer']
                
                # Правильный ответ = 5 баллов, неправильный = 0 баллов
                if user_answer == correct_answer:
                    total_score += 5
            
            # Средний балл по компетенции
            competency_scores[competency] = total_score / total_questions if total_questions > 0 else 0
    
    # Разделяем на hard и soft skills
    hard_skills_score = sum(competency_scores.get(comp, 0) for comp in matrix['hardSkills'])
    soft_skills_score = sum(competency_scores.get(comp, 0) for comp in matrix['softSkills'])
    
    # Определяем грейды
    def get_grade(score, skill_type):
        thresholds = matrix['gradeThresholds'][skill_type]
        if score >= thresholds['Руководитель направления']:
            return 'Руководитель направления'
        elif score >= thresholds['Главный дизайнер']:
            return 'Главный дизайнер'
        elif score >= thresholds['Ведущий дизайнер']:
            return 'Ведущий дизайнер'
        elif score >= thresholds['Дизайнер']:
            return 'Дизайнер'
        elif score >= thresholds['Младший дизайнер']:
            return 'Младший дизайнер'
        else:
            return 'Стажёр'
    
    # Подробные результаты по компетенциям
    detailed_results = []
    for competency in matrix['hardSkills'] + matrix['softSkills']:
        if competency in competency_scores:
            skill_type = 'hardSkills' if competency in matrix['hardSkills'] else 'softSkills'
            detailed_results.append({
                'competency': competency,
                'score': round(competency_scores[competency], 2),
                'maxScore': 5,
                'type': skill_type,
                'percentage': round((competency_scores[competency] / 5) * 100, 1)
            })
    
    # Общие результаты
    result = {
        'testId': test_id,
        'userId': test_data['userId'],
        'hardSkills': {
            'score': round(hard_skills_score, 2),
            'maxScore': len(matrix['hardSkills']) * 5,
            'grade': get_grade(hard_skills_score, 'hardSkills'),
            'percentage': round((hard_skills_score / (len(matrix['hardSkills']) * 5)) * 100, 1)
        },
        'softSkills': {
            'score': round(soft_skills_score, 2),
            'maxScore': len(matrix['softSkills']) * 5,
            'grade': get_grade(soft_skills_score, 'softSkills'),
            'percentage': round((soft_skills_score / (len(matrix['softSkills']) * 5)) * 100, 1)
        },
        'totalScore': round(hard_skills_score + soft_skills_score, 2),
        'totalMaxScore': (len(matrix['hardSkills']) + len(matrix['softSkills'])) * 5,
        'detailedResults': detailed_results,
        'competencyScores': competency_scores
    }
    
    # Очищаем данные теста
    del active_tests[test_id]
    
    return jsonify(result)

@app.route('/api/matrix-info', methods=['GET'])
def get_matrix_info():
    return jsonify({
        'hardSkills': matrix['hardSkills'],
        'softSkills': matrix['softSkills'],
        'grades': matrix['grades'],
        'thresholds': matrix['gradeThresholds'],
        'totalCompetencies': len(matrix['hardSkills']) + len(matrix['softSkills']),
        'hardSkillsCount': len(matrix['hardSkills']),
        'softSkillsCount': len(matrix['softSkills'])
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Competency assessment API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
