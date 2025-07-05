import { useEffect, useRef } from "react";
import { vertWGSL, fragWGSL } from "./shader";

export default function Triange() {
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
                },
                fragment: {
                    module: device.createShaderModule({ code: fragWGSL }),
                    entryPoint: "main",
                    targets: [{ format: presentationFormat }],
                },
                primitive: { topology: "triangle-list" },
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

                const passEncoder =
                    commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.setPipeline(pipeline);
                passEncoder.draw(3, 1, 0, 0);
                passEncoder.end();

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
