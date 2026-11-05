from flask import Flask, jsonify, request
from flask_cors import CORS # <--- 1. Importas la librería
from datetime import datetime

app = Flask(__name__)
CORS(app) # <--- 2. Activas CORS para toda la app

evaluaciones = [
    {
        "id": "01",
        "fecha": "2026-11-09",
        "materia": "Matematicas",
        "tipo": "Examen",
        "descripcion": "Determinante de 2do Grado",
        "criterio": "Examen sobre en todo lo visto en clase, formulas abajo."
    },
    {
        "id": "02",
        "fecha": "2026-11-09",
        "materia": "Quimica",
        "tipo": "Taller",
        "descripcion": "El Carbono",
        "criterio": "Taller sobre todo lo que tiene q ver con el carbono."
    },
    {
        "id": "04",
        "fecha": "2026-11-12",
        "materia": "CS de la Tierra",
        "tipo": "Mapa Mental",
        "descripcion": "Placas Tectonicas",
        "criterio": "Mapa mental en clase sobre todo lo visto referente al tema."
    }
]

@app.route('/api/evaluaciones', methods=['GET'])
def obtener_evaluaciones():
    hoy = datetime.now()
    lista_con_alertas = []
    
    for item in evaluaciones:
        fecha_eval = datetime.strptime(item["fecha"], "%Y-%m-%d")
        dias_restantes = (fecha_eval - hoy).days
        alerta_activa = True if 0 <= dias_restantes <= 2 else False
        
        evaluacion_procesada = {
            "materia": item["materia"],
            "tipo": item["tipo"],
            "fecha": item["fecha"],
            "dias_restantes": dias_restantes,
            "alerta": alerta_activa
        }
        lista_con_alertas.append(evaluacion_procesada)
        
    return jsonify(lista_con_alertas)

if __name__ == '__main__':
    app.run(debug=True, port=5000)