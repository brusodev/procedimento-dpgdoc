"""
Script to check video URLs in the database
"""
import sqlite3
import requests

def check_videos():
    conn = sqlite3.connect('tutorial_system.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT s.id, t.title, s.title, s.video_url
        FROM steps s
        JOIN tutorials t ON s.tutorial_id = t.id
        WHERE s.video_url IS NOT NULL
    ''')

    results = cursor.fetchall()

    if not results:
        print("[ERROR] Nenhum video encontrado no banco de dados!")
        return

    print(f"\n[OK] Encontrados {len(results)} video(s) no banco:\n")
    print("=" * 100)

    for step_id, tutorial_title, step_title, video_url in results:
        print(f"\n[VIDEO] Tutorial: {tutorial_title}")
        print(f"   Passo: {step_title}")
        print(f"   URL: {video_url}")

        # Verificar se a URL está acessível
        try:
            response = requests.head(video_url, timeout=5)
            if response.status_code == 200:
                print(f"   [OK] Status: Video acessivel (HTTP {response.status_code})")
                print(f"   [SIZE] Tamanho: {response.headers.get('Content-Length', 'Desconhecido')} bytes")
                print(f"   [TYPE] Tipo: {response.headers.get('Content-Type', 'Desconhecido')}")
            else:
                print(f"   [WARNING] Status: HTTP {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"   [ERROR] Erro ao acessar: {str(e)}")

        print("-" * 100)

    conn.close()

if __name__ == "__main__":
    print("\n" + "=" * 100)
    print("DPGDOC ACADEMY - Verificação de Vídeos")
    print("=" * 100)
    check_videos()
    print("\n")
