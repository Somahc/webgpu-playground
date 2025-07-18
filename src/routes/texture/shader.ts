export const vertWGSL = `
struct Uniforms {
    projectionMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    worldMatrix : mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>  
) -> VertexOutput {

	var output : VertexOutput;
	output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.worldMatrix * position;
    output.fragUV = uv;

    return output;
}
`;

export const fragWGSL = `
@group(0) @binding(1) var myTexture: texture_2d<f32>;
@group(0) @binding(2) var mySampler: sampler;

@fragment
fn main(
    @location(0) fragUV: vec2<f32>,
) -> @location(0) vec4<f32> {
    return textureSample(myTexture, mySampler, fragUV);
}
`;
