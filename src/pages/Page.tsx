import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useRef } from "react";
import {
	getPanelElement,
	getPanelGroupElement,
	getResizeHandleElement,
} from "react-resizable-panels";

export default function Home() {
	// const refs = useRef();

	useEffect(() => {
		// const groupElement = getPanelGroupElement("group");
		const bootPanel = getPanelElement("boot");
		const rootPanel = getPanelElement("root");
		const homePanel = getPanelElement("home");

		console.log(bootPanel);
		console.log(rootPanel?.getSize());
		console.log(homePanel);

		// refs.current = {
		// 	groupElement,
		// 	bootPanel,
		// 	rootPanel,
		// 	homePanel,
		// };
	}, []);
	return (
		<>
			<div className="w-lg space-y-2 mx-auto p-4 h-auto">
				<div className="space-y-2">
					<h2>Root</h2>
					<Input placeholder="Password" />
					<Input placeholder="Confirm password" />
				</div>
				<div className="space-y-2">
					<h2>User</h2>
					<Input placeholder="User" />
					<Input placeholder="Password" />
					<Input placeholder="Confirm password" />
					<Label className="py-2">
						<Checkbox /> <span>Allow to use sudo</span>
					</Label>
					<Button className="w-full">NEXT</Button>
				</div>

				<div className="space-y-2">
					<h2>Select Disk</h2>
					<Label className="border p-2 rounded-sm">
						<Checkbox /> <span>/dev/sda</span>
					</Label>
					<Label className="border p-2 rounded-sm">
						<Checkbox /> <span>/dev/sdb</span>
					</Label>
					<Label className="border p-2 rounded-sm">
						<Checkbox /> <span>/dev/nvme0n1</span>
					</Label>
				</div>

				<div className="space-y-2">
					<h2>Create Partition</h2>
					<Label className="border p-2 rounded-sm flex place-content-between">
						<span>/boot/efi</span>
						<div className="space-x-4">
							<span>5%</span>
							<span>ext4</span>
						</div>
					</Label>
					<Label className="border p-2 rounded-sm flex place-content-between">
						<span>/</span>
						<div className="space-x-4">
							<span>20%</span>
							<span>ext4</span>
						</div>
					</Label>
					<Label className="border p-2 rounded-sm flex place-content-between">
						<span>/home</span>
						<div className="space-x-4">
							<span>75%</span>
							<span>ext4</span>
						</div>
					</Label>
				</div>

				<ResizablePanelGroup
					direction="vertical"
					className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]"
					id="group"
				>
					<ResizablePanel defaultSize={25} id="boot">
						<div className="flex h-full items-center justify-center p-6">
							<span className="font-semibold">Sidebar</span>
						</div>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={75} id="root">
						<div className="flex h-full items-center justify-center p-6">
							<span className="font-semibold">Content</span>
						</div>
					</ResizablePanel>
					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={75} id="home">
						<div className="flex h-full items-center justify-center p-6">
							<span className="font-semibold">Content</span>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</>
	);
}
