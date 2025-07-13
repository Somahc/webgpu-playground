import { useEffect, useRef } from "react";
import { vertWGSL, fragWGSL } from "./shader";
import {
    cubeColorOffset,
    cubePositionOffset,
    cubeVertexArray,
    cubeVertexCount,
    cubeVertexSize,
} from "./geometry";
import * as glMatrix from "gl-matrix";

export default function UniformBuffer() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const start = async () => {
            const adapter = await navigator.gpu?.requestAdapter();
            const device = await adapter?.requestDevice();
            if (!device || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const context = canvas.getContext("webgpu") as GPUCanvasContext;
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

            context.configure({
                device: device,
                format: presentationFormat,
                alphaMode: "opaque",
            });

            const getTransformationMatrix = (uniformBuffer: GPUBuffer) => {
                const projectionMatrix = glMatrix.mat4.create();
                glMatrix.mat4.perspective(
                    projectionMatrix,
                    (2 * Math.PI) / 5,
                    1,
                    1,
                    100.0
                );
                device.queue.writeBuffer(
                    uniformBuffer,
                    4 * 16 * 0,
                    projectionMatrix.buffer,
                    projectionMatrix.byteOffset,
                    projectionMatrix.byteLength
                );

                const viewMatrix = glMatrix.mat4.create();
                glMatrix.mat4.translate(
                    viewMatrix,
                    viewMatrix,
                    glMatrix.vec3.fromValues(0, 0, -4)
                );
                device.queue.writeBuffer(
                    uniformBuffer,
                    4 * 16 * 1,
                    viewMatrix.buffer,
                    viewMatrix.byteOffset,
                    viewMatrix.byteLength
                );

                const worldMatrix = glMatrix.mat4.create();
                const now = Date.now() / 1000;
                glMatrix.mat4.rotate(
                    worldMatrix,
                    worldMatrix,
                    1,
                    glMatrix.vec3.fromValues(Math.sin(now), Math.cos(now), 0)
                );

                device.queue.writeBuffer(
                    uniformBuffer,
                    4 * 16 * 2,
                    worldMatrix.buffer,
                    worldMatrix.byteOffset,
                    worldMatrix.byteLength
                );
            };

            const pipeline = device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: device.createShaderModule({ code: vertWGSL }),
                    entryPoint: "main",
                    buffers: [
                        {
                            // 配列の要素感の距離（バイト単位）
                            arrayStride: cubeVertexSize,

                            // 頂点バッファの属性
                            attributes: [
                                {
                                    // position
                                    shaderLocation: 0, // vertex shaderの@location(0)
                                    offset: cubePositionOffset,
                                    format: "float32x4",
                                },
                                {
                                    // color
                                    shaderLocation: 1, // vertex shaderの@location(1)
                                    offset: cubeColorOffset,
                                    format: "float32x4",
                                },
                            ],
                        },
                    ],
                },
                fragment: {
                    module: device.createShaderModule({ code: fragWGSL }),
                    entryPoint: "main",
                    targets: [{ format: presentationFormat }],
                },
                primitive: { topology: "triangle-list" },
            });

            // 頂点バッファの作成
            const verticesBuffer = device.createBuffer({
                size: cubeVertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            });

            new Float32Array(verticesBuffer.getMappedRange()).set(
                cubeVertexArray
            );
            verticesBuffer.unmap();

            // Uniformバッファの作成
            const uniformBufferSize = 4 * 16 * 3; // 4bytes * 4x4 matrix * 3 matrices
            const uniformBuffer = device.createBuffer({
                size: uniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            const uniformBindGroup = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0, // shaderの@binding(0)
                        resource: {
                            buffer: uniformBuffer,
                        },
                    },
                ],
            });

            const frame = () => {
                const commandEncoder = device.createCommandEncoder();
                const textureView = context.getCurrentTexture().createView();

                const renderPassDescriptor: GPURenderPassDescriptor = {
                    colorAttachments: [
                        {
                            view: textureView,
                            clearValue: { r: 0, g: 0, b: 0, a: 1 },
                            loadOp: "clear",
                            storeOp: "store",
                        },
                    ],
                };

                getTransformationMatrix(uniformBuffer);

                const renderPassEncoder =
                    commandEncoder.beginRenderPass(renderPassDescriptor);
                renderPassEncoder.setPipeline(pipeline);
                renderPassEncoder.setBindGroup(0, uniformBindGroup); // bind groupを設定
                renderPassEncoder.setVertexBuffer(0, verticesBuffer);
                renderPassEncoder.draw(cubeVertexCount); // インデックス描画の場合はdraw()ではなくdrawIndexed()
                renderPassEncoder.end();

                device.queue.submit([commandEncoder.finish()]);
                requestAnimationFrame(frame);
            };

            requestAnimationFrame(frame);
        };

        start();
    }, []);

    return (
        <>
            <h2>Uniform Buffer</h2>
            <canvas
                id="webgpu-canvas"
                ref={canvasRef}
                width={480}
                height={480}
            ></canvas>
        </>
    );
}
