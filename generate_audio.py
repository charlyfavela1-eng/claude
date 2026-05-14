#!/usr/bin/env python3
"""
Voice cloning audio generator using VoxCPM2.

Usage:
  python generate_audio.py --text "Tu texto aquí" --reference voice.wav --output salida.wav
  python generate_audio.py --file textos.txt --reference voice.wav --output-dir audios/

Requirements:
  pip install -r requirements.txt
"""

import argparse
import sys
from pathlib import Path


def load_model():
    try:
        from voxcpm import VoxCPM
    except ImportError:
        print("Error: voxcpm no está instalado. Ejecuta: pip install -r requirements.txt")
        sys.exit(1)

    print("Cargando modelo VoxCPM2...")
    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
    print("Modelo listo.")
    return model


def generate_single(model, text: str, reference: str, output: str, cfg: float, steps: int):
    import soundfile as sf

    ref_path = Path(reference)
    if not ref_path.exists():
        print(f"Error: no se encontró el archivo de referencia '{reference}'")
        sys.exit(1)

    print(f"Generando audio para: {text!r}")
    wav = model.generate(
        text=text,
        reference_audio=str(ref_path),
        cfg_value=cfg,
        inference_timesteps=steps,
    )

    out_path = Path(output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out_path), wav, model.tts_model.sample_rate)
    print(f"Audio guardado en: {out_path}")


def generate_batch(model, text_file: str, reference: str, output_dir: str, cfg: float, steps: int):
    import soundfile as sf

    ref_path = Path(reference)
    if not ref_path.exists():
        print(f"Error: no se encontró el archivo de referencia '{reference}'")
        sys.exit(1)

    lines = Path(text_file).read_text(encoding="utf-8").splitlines()
    lines = [l.strip() for l in lines if l.strip()]

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for i, text in enumerate(lines, 1):
        print(f"[{i}/{len(lines)}] Generando: {text!r}")
        wav = model.generate(
            text=text,
            reference_audio=str(ref_path),
            cfg_value=cfg,
            inference_timesteps=steps,
        )
        out_path = out_dir / f"audio_{i:03d}.wav"
        sf.write(str(out_path), wav, model.tts_model.sample_rate)
        print(f"  Guardado en: {out_path}")

    print(f"\nListo. {len(lines)} audios generados en '{out_dir}'")


def main():
    parser = argparse.ArgumentParser(
        description="Genera audios con tu voz usando VoxCPM2 (clonación de voz)"
    )

    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--text", "-t", help="Texto a convertir en audio")
    mode.add_argument("--file", "-f", help="Archivo .txt con un texto por línea (modo batch)")

    parser.add_argument(
        "--reference", "-r", required=True,
        help="Archivo de audio con tu voz (WAV, 5-30 seg recomendado)"
    )
    parser.add_argument(
        "--output", "-o", default="output.wav",
        help="Archivo de salida (solo con --text, por defecto: output.wav)"
    )
    parser.add_argument(
        "--output-dir", "-d", default="audios_generados",
        help="Directorio de salida para modo batch (por defecto: audios_generados/)"
    )
    parser.add_argument(
        "--cfg", type=float, default=2.0,
        help="Fuerza de guía del clasificador (por defecto: 2.0)"
    )
    parser.add_argument(
        "--steps", type=int, default=10,
        help="Pasos de inferencia — más pasos = más calidad, más lento (por defecto: 10)"
    )

    args = parser.parse_args()

    model = load_model()

    if args.text:
        generate_single(model, args.text, args.reference, args.output, args.cfg, args.steps)
    else:
        generate_batch(model, args.file, args.reference, args.output_dir, args.cfg, args.steps)


if __name__ == "__main__":
    main()
