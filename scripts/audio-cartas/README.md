# Áudios das Cartas

Os áudios ficam em `public/audio/cartas/<hash>.mp3`, onde o hash são os 16 primeiros
caracteres do SHA-1 de `"<idioma>|<frase correta>"`. A lista de arquivos gerados fica em
`lib/cartas-audio.json`. Se a frase mudar, o hash muda e a carta fica sem áudio até gerar de novo
(ou até a professora gravar o dela no painel, que tem prioridade).

## Vozes

| Idioma | Voz | Uso | Modelo |
|---|---|---|---|
| Espanhol | **Claude (México)**, feminina, nativa | **atual** | Piper `es_MX-claude-high` |
| Espanhol | **Sharvard (Espanha)**, feminina, nativa | **reserva** (a Tuanne achou menos artificial) | Piper `es_ES-sharvard-medium`, speaker F = 1 |
| Espanhol | Dora | antiga (sotaque americano, R retroflexo) | Kokoro `ef_dora` |
| Inglês | **Heart**, feminina, EUA | **atual** | Kokoro `af_heart` |

Os modelos Piper vêm dos releases do sherpa-onnx no GitHub:
`https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-<nome>.tar.bz2`

O Kokoro vem de `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/`.

## Como trocar a voz do espanhol

1. `pip install piper-tts kokoro-onnx soundfile` e baixe o modelo.
2. Rode `python3 scripts/audio-cartas/gerar.py --espanhol espanha` (ou `mexico`) com a lista de frases.
3. Em `components/telas-aluno/cartas.tsx`, mude `VOZ_ES` (ex.: `"es1"`) para os navegadores baixarem de novo.
