// TODO: Destroy render targets if size changed and exists

import { Geometry } from '../core/Geometry.js';
import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { RenderTarget } from '../core/RenderTarget.js';
import { OGLRenderingContext } from '../core/Renderer.js';
import { FlowmapMask } from './Flowmap.js';

export interface PostOptions { // TODO: reuse this interface somewhere else?
    width?: number;
    height?: number;

    wrapS: GLenum;
    wrapT: GLenum;
    minFilter: GLenum;
    magFilter: GLenum;
}

export class Post {
    gl: OGLRenderingContext;
    width: number;
    height: number;
    dpr: number;

    options: PostOptions;
    passes: any[];

    geometry: Geometry;
    fbo: FlowmapMask;

    constructor(gl: OGLRenderingContext, {
        width,
        height,
        dpr,
        wrapS = gl.CLAMP_TO_EDGE,
        wrapT = gl.CLAMP_TO_EDGE,
        minFilter = gl.LINEAR,
        magFilter = gl.LINEAR,
        geometry = new Geometry(gl, {
            position: {size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3])},
            uv: {size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2])},
        }),
    }: Partial<{
        width: number;
        height: number;
        dpr: number;
        geometry: Geometry;
    } & PostOptions> = {}) {
        this.gl = gl;

        this.options = {wrapS, wrapT, minFilter, magFilter};

        this.passes = [];

        this.geometry = geometry;

        const fbo = this.fbo = {
            read: null,
            write: null,
            swap: () => {
                let temp = fbo.read;
                fbo.read = fbo.write;
                fbo.write = temp;
            },
        };

        this.resize({width, height, dpr});
    }

    addPass({
        vertex = defaultVertex,
        fragment = defaultFragment,
        uniforms = {},
        textureUniform = 'tMap',
        enabled = true,
    } = {}) {
        uniforms[textureUniform] = {value: this.fbo.read.texture};

        const program = new Program(this.gl, {vertex, fragment, uniforms});
        const mesh = new Mesh(this.gl, {geometry: this.geometry, program});

        const pass = {
            mesh,
            program,
            uniforms,
            enabled,
            textureUniform,
        };

        this.passes.push(pass);
        return pass;
    }

    resize({
        width,
        height,
        dpr
    }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }> = {}) {
        if (dpr) this.dpr = dpr;
        if (width) {
            this.width = width;
            this.height = height || width;
        }

        dpr = this.dpr || this.gl.renderer.dpr;
        width = (this.width || this.gl.renderer.width) * dpr;
        height = (this.height || this.gl.renderer.height) * dpr;

        this.options.width = width;
        this.options.height = height;

        this.fbo.read = new RenderTarget(this.gl, this.options);
        this.fbo.write = new RenderTarget(this.gl, this.options);
    }

    // Uses same arguments as renderer.render
    render({
        scene,
        camera,
        target = null,
        update = true,
        sort = true,
        frustumCull = true,
    }) {
        const enabledPasses = this.passes.filter(pass => pass.enabled);

        this.gl.renderer.render({
            scene, camera,
            target: enabledPasses.length ? this.fbo.write : target,
            update, sort, frustumCull,
        });
        this.fbo.swap();

        enabledPasses.forEach((pass, i) => {
            pass.mesh.program.uniforms[pass.textureUniform].value = this.fbo.read.texture;
            this.gl.renderer.render({
                scene: pass.mesh,
                target: i === enabledPasses.length - 1 ? target : this.fbo.write,
                clear: false,
            });
            this.fbo.swap();
        });
    }
}

const defaultVertex = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const defaultFragment = `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
