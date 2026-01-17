import Phaser from 'phaser';

export class WobblePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'Wobble',
            fragShader: `
                precision mediump float;
                uniform sampler2D uMainSampler;
                uniform float uTime;
            varying vec2 outTexCoord;

            // Simple Pseudo-Random Noise
            float rand(vec2 co) {
                return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
            }

                // 2D Noise (Value Noise) for Clouds
                float noise(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);

                    // Four corners in 2D of a tile
                    float a = rand(i);
                    float b = rand(i + vec2(1.0, 0.0));
                    float c = rand(i + vec2(0.0, 1.0));
                    float d = rand(i + vec2(1.0, 1.0));

                    // Cubic Hermite Spline
                    vec2 u = f * f * (3.0 - 2.0 * f);

                return mix(a, b, u.x) +
                    (c - a) * u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
            }

                void main() {
            vec2 uv = outTexCoord;

            // --- 1. WOBBLE EFFECT (The Boiling) ---
            float freq = 80.0;
            float amp = 0.0015;
            float speed = 0.005;

            uv.x += sin(uv.y * freq + uTime * speed) * amp;
            uv.y += cos(uv.x * freq + uTime * speed) * amp;

            vec4 color = texture2D(uMainSampler, uv);

            // --- 2. CLOUD SHADOWS (The Atmosphere) ---
            // Large scale noise moving slowly
            float cloudScale = 3.0;
            float cloudSpeed = 0.0001; // Very slow

            // Create moving coordinate for clouds
            vec2 cloudUV = uv * cloudScale;
            cloudUV.x += uTime * cloudSpeed;
            cloudUV.y += uTime * (cloudSpeed * 0.5); // Diagonal drift

            // Sample Noise
            float n = noise(cloudUV);

            // Threshold to create defined "Shadow Blobs" vs smooth gradient
            // Smoothstep makes edges soft but defined
            float shadow = smoothstep(0.4, 0.7, n);

            // Apply Shadow (Darken)
            // We only darken the ground, effectively. 
            // Intensity: 0.15 (Subtle)
            color.rgb -= shadow * 0.15;

            // Vignette (Optional: Focus on center)
            float dist = distance(uv, vec2(0.5));
            color.rgb *= smoothstep(0.8, 0.2, dist * 0.5); // Subtle dark corners

            gl_FragColor = color;
        }
            `
        });
    }

    onPreRender() {
        // Pass time to the shader
        this.set1f('uTime', this.game.loop.time);
    }
}
