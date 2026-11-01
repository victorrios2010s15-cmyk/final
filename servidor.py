import json
import re
import datetime
import webbrowser
import time

def revisar_cronograma():
    try:
        with open("app.js", "r", encoding="utf-8") as f:
            contenido = f.read()
        
        match = re.search(r"const\s+evaluaciones\s*=\s*(\[.*?\]);", contenido, re.DOTALL)
        if not match:
            return
            
        json_texto = match.group(1)
        json_texto = re.sub(r"//.*?\n", "", json_texto)
        json_texto = re.sub(r",\s*([\]}])", r"\1", json_texto)
        
        evaluaciones = json.loads(json_texto)
        hoy = datetime.date.today()
        
        for ev in evaluaciones:
            fecha_ev = datetime.datetime.strptime(ev["fecha"], "%Y-%m-%d").date()
            dias_restantes = (fecha_ev - hoy).days
            
            if dias_restantes == 2:
                print(f"Alerta: {ev['materia']} vence en 2 días. Despertando sistema...")
                webbrowser.open("http://127.0.0.1:8080")
                break
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    revisar_cronograma()
