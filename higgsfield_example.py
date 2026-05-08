"""
Higgsfield AI client example.

Set credentials before running:
  export HF_API_KEY="your-api-key"
  export HF_API_SECRET="your-api-secret"
  # or combined:
  export HF_KEY="your-api-key:your-api-secret"

Get your credentials at https://cloud.higgsfield.ai/
"""

import higgsfield_client


def main():
    # Synchronous text-to-image generation
    result = higgsfield_client.subscribe(
        "bytedance/seedream/v4/text-to-image",
        arguments={
            "prompt": "A cinematic sunset over the ocean, golden hour",
            "resolution": "2K",
            "aspect_ratio": "16:9",
            "camera_fixed": False,
        },
    )

    print("Image URL:", result["images"][0]["url"])


if __name__ == "__main__":
    main()
