import { useEffect, useRef } from "react";
import { vertWGSL, fragWGSL } from "./shader";
import {
    quadColorOffset,
    quadPositionOffset,
    quadVertexArray,
    quadVertexCount,
    quadVertexSize,
} from "./geometry";

export default function FirstVertexBuffer() {
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

            const pipeline = device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: device.createShaderModule({ code: vertWGSL }),
                    entryPoint: "main",
                    buffers: [
                        {
                            // 配列の要素感の距離（バイト単位）
                            arrayStride: quadVertexSize,

                            // 頂点バッファの属性
                            attributes: [
                                {
                                    // position
                                    shaderLocation: 0, // vertex shaderの@location(0)
                                    offset: quadPositionOffset,
                                    format: "float32x4",
                                },
                                {
                                    // color
                                    shaderLocation: 1, // vertex shaderの@location(1)
                                    offset: quadColorOffset,
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

            const verticesBuffer = device.createBuffer({
                size: quadVertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            });

            new Float32Array(verticesBuffer.getMappedRange()).set(
                quadVertexArray
            );
            verticesBuffer.unmap();

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

                const renderPassEncoder =
                    commandEncoder.beginRenderPass(renderPassDescriptor);
                renderPassEncoder.setPipeline(pipeline);
                renderPassEncoder.setVertexBuffer(0, verticesBuffer);
                renderPassEncoder.draw(quadVertexCount, 1, 0, 0);
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
            <h2>Triangle Page</h2>
            <canvas
                id="webgpu-canvas"
                ref={canvasRef}
                width={640}
                height={480}
            ></canvas>
        </>
    );
}
