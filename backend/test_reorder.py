"""
Script de teste para a funcionalidade de reordenação de steps
"""
import json

# Exemplo de como usar o endpoint de reordenação

# Endpoint: POST /api/tutorials/{tutorial_id}/steps/reorder
# Requer autenticação (token JWT)

example_request = {
    "steps": [
        {"step_id": "uuid-do-step-1", "new_order": 3},
        {"step_id": "uuid-do-step-2", "new_order": 1},
        {"step_id": "uuid-do-step-3", "new_order": 2}
    ]
}

# Exemplo usando curl (Windows PowerShell):
curl_example = """
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_JWT_AQUI"
    "Content-Type" = "application/json"
}

$body = @{
    steps = @(
        @{step_id = "uuid-do-step-1"; new_order = 3},
        @{step_id = "uuid-do-step-2"; new_order = 1},
        @{step_id = "uuid-do-step-3"; new_order = 2}
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/tutorials/TUTORIAL_ID/steps/reorder" -Method Post -Headers $headers -Body $body
"""

# Exemplo usando Python requests:
python_example = """
import requests

url = "http://localhost:8000/api/tutorials/TUTORIAL_ID/steps/reorder"
headers = {
    "Authorization": "Bearer SEU_TOKEN_JWT_AQUI",
    "Content-Type": "application/json"
}

data = {
    "steps": [
        {"step_id": "uuid-do-step-1", "new_order": 3},
        {"step_id": "uuid-do-step-2", "new_order": 1},
        {"step_id": "uuid-do-step-3", "new_order": 2}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
"""

print("=" * 60)
print("ENDPOINT DE REORDENAÇÃO DE STEPS")
print("=" * 60)
print("\nEndpoint: POST /api/tutorials/{tutorial_id}/steps/reorder")
print("\nExemplo de requisição:")
print(json.dumps(example_request, indent=2))
print("\n" + "=" * 60)
print("EXEMPLO USANDO CURL (PowerShell):")
print("=" * 60)
print(curl_example)
print("\n" + "=" * 60)
print("EXEMPLO USANDO PYTHON REQUESTS:")
print("=" * 60)
print(python_example)
print("\n" + "=" * 60)
print("COMO FUNCIONA:")
print("=" * 60)
print("""
1. Envie uma lista de steps com seus IDs e as novas ordens desejadas
2. O endpoint verifica se todos os steps pertencem ao tutorial
3. Atualiza a ordem de cada step no banco de dados
4. Retorna todos os steps do tutorial ordenados pela nova ordem

IMPORTANTE:
- Somente o criador do tutorial ou um admin pode reordenar os steps
- Todos os step_ids devem pertencer ao tutorial especificado
- A ordem pode ser qualquer número inteiro (não precisa ser sequencial)
""")
