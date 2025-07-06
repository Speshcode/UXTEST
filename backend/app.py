
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random

app = Flask(__name__)
CORS(app)

with open('./data/matrix.json', encoding='utf-8') as f:
    matrix = json.load(f)

with open('./data/questions.json', encoding='utf-8') as f:
    questions = json.load(f)

@app.route('/api/generate-test', methods=['GET'])
def generate_test():
    test = []
    for comp in matrix['hardSkills'] + matrix['softSkills']:
        for grade in matrix['grades']:
            qlist = questions[comp][grade]
            if qlist:
                q = random.choice(qlist)
                test.append({'competency': comp, 'grade': grade, **q})
    random.shuffle(test)
    return jsonify(test)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    answers = request.json
    weights = matrix['gradeWeights']
    cat_score = {'hard': 0, 'soft': 0}

    for comp in matrix['hardSkills']:
        scores = [weights[grade] if answers.get(comp, {}).get(grade) else 0 for grade in matrix['grades']]
        cat_score['hard'] += sum(scores) / len(scores)

    for comp in matrix['softSkills']:
        scores = [weights[grade] if answers.get(comp, {}).get(grade) else 0 for grade in matrix['grades']]
        cat_score['soft'] += sum(scores) / len(scores)

    def grade_name(s): return 'Главный дизайнер' if s >= 68 else 'Ведущий дизайнер' if s >= 51 else 'Дизайнер' if s >= 34 else 'Младший дизайнер' if s >= 17 else 'Стажёр'

    return jsonify({
        'hardSkills': {'score': round(cat_score['hard']), 'total': len(matrix['hardSkills']) * 5, 'grade': grade_name(cat_score['hard'])},
        'softSkills': {'score': round(cat_score['soft']), 'total': len(matrix['softSkills']) * 5, 'grade': grade_name(cat_score['soft'])}
    })

if __name__ == '__main__':
    app.run(port=5000)
