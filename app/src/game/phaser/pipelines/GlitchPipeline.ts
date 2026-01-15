import { Renderer, Game } from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

varying vec2 outTexCoord;

// Pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
    vec2 uv = outTexCoord;
    
    // 0. Base Color
    vec4 color = texture2D(uMainSampler, uv);

    if (uIntensity > 0.0) {
        // 1. Shake / Displacement
        float shake = (random(vec2(uTime, uv.y)) - 0.5) * uIntensity * 0.1;
        
        // 2. Chromatic Aberration (RGB Split)
        float r = texture2D(uMainSampler, uv + vec2(shake + 0.01 * uIntensity, 0.0)).r;
        float g = texture2D(uMainSampler, uv + vec2(shake, 0.0)).g;
        float b = texture2D(uMainSampler, uv + vec2(shake - 0.01 * uIntensity, 0.0)).b;
        
        // 3. Scanline / Noise
        float scanline = sin(uv.y * uResolution.y * 0.5 + uTime * 10.0) * 0.1 * uIntensity;
        
        color = vec4(r, g, b, 1.0);
        color.rgb -= scanline;
    }

    gl_FragColor = color;
}
`;

export class GlitchPipeline extends Renderer.WebGL.Pipelines.PostFXPipeline {
    private _intensity: number = 0;
    private _t: number = 0;

    constructor(game: Game) {
        super({
            game,
            name: 'GlitchPipeline',
            fragShader
        });
    }

    onPreRender() {
        this._t += 0.05;
        this.set1f('uTime', this._t);
        this.set1f('uIntensity', this._intensity);
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
    }

    public set intensity(value: number) {
        this._intensity = value;
    }

    public get intensity(): number {
        return this._intensity;
    }
}
