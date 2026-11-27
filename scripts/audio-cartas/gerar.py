"""Gera os áudios das Cartas. Uso:
  python3 gerar.py frases.json --espanhol mexico|espanha [--ingles]
frases.json = lista de [idioma, frase correta] (exporte do banco:
  select json_agg(json_build_array(idioma, correta)) from (select distinct idioma, correta from cartas) x;)
"""
import argparse, hashlib, json, os, subprocess, wave

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, "public/audio/cartas")
MODELOS = "/tmp/piper"  # onde os modelos foram extraídos
ESPANHOL = {
    "mexico": ("es_MX-claude-high", None),
    "espanha": ("es_ES-sharvard-medium", 1),  # speaker F
}

def mp3(wav, destino):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k", destino], check=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frases")
    ap.add_argument("--espanhol", choices=ESPANHOL, default="mexico")
    ap.add_argument("--ingles", action="store_true", help="gerar também o inglês (Kokoro af_heart)")
    a = ap.parse_args()
    frases = json.load(open(a.frases))
    from piper import PiperVoice, SynthesisConfig
    nome, sid = ESPANHOL[a.espanhol]
    voz_es = PiperVoice.load(f"{MODELOS}/vits-piper-{nome}/{nome}.onnx")
    kokoro = None
    if a.ingles:
        from kokoro_onnx import Kokoro
        kokoro = Kokoro("/tmp/tts/kokoro-v1.0.onnx", "/tmp/tts/voices-v1.0.bin")
    manifesto_path = os.path.join(RAIZ, "lib/cartas-audio.json")
    feitos = set(json.load(open(manifesto_path))) if os.path.exists(manifesto_path) else set()
    for idioma, texto in frases:
        h = hashlib.sha1(f"{idioma}|{texto}".encode()).hexdigest()[:16]
        falar = texto.replace("A/B", "A B").replace("…", ".")
        if idioma == "espanhol":
            with wave.open("/tmp/carta.wav", "wb") as w:
                voz_es.synthesize_wav(falar, w, syn_config=SynthesisConfig(speaker_id=sid, length_scale=1.1))
        elif kokoro:
            import soundfile as sf
            s, sr = kokoro.create(falar, voice="af_heart", speed=0.9, lang="en-us")
            sf.write("/tmp/carta.wav", s, sr)
        else:
            continue
        mp3("/tmp/carta.wav", os.path.join(SAIDA, f"{h}.mp3"))
        feitos.add(h)
    json.dump(sorted(feitos), open(manifesto_path, "w"))
    print("ok", len(feitos))

if __name__ == "__main__":
    main()
