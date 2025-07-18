export const vertWGSL = `
struct Uniforms {
    projectionMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    worldMatrix: mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragColor: vec4<f32>,
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>
) -> VertexOutput {
    
    var output : VertexOutput;
    output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.worldMatrix * position;
    output.fragColor = color;

    return output;
}
`;

export const fragWGSL = `
@fragment
fn main(
    @location(0) fragColor: vec4<f32>,
) -> @location(0) vec4<f32> {
    return fragColor;
}
`;
