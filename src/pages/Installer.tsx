import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { Globe } from "@/components/magicui/globe";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BlockDeviceInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export default function Installer() {
	const [config, setConfig] = useState({
		disk: "",
	});
	const [done, setDone] = useState(false);
	const [installing, setInstalling] = useState(false);
	const [installErrors, setInstallerErrors] = useState("");
	const [value, setValue] = useState(0);
	const [step, setStep] = useState("");
	const [longStep, setLongStep] = useState(false);

	const { data, status, error, refetch } = useQuery({
		queryKey: ["block_devices"],
		queryFn: async () => {
			return (await invoke("get_block_devices")) as BlockDeviceInfo;
		},
	});

	async function sleep(duration: number) {
		return await new Promise((res) => {
			setTimeout(() => {
				res(true);
			}, duration);
		});
	}

	async function install() {
		try {
			setInstalling(true);

			setStep("Checking system configuration");
			setValue(10);
			await sleep(3000);

			setStep("Creating up partition table");
			setValue(20);
			await sleep(3000);
			await invoke("make_partition_table", { name: config.disk });

			setStep("Formatting new partitions");
			setValue(30);
			await sleep(2000);
			const update = await refetch();
			const partitions =
				update.data?.blockdevices
					.filter((parent) => parent.name === config.disk)
					?.at(0)?.children ?? [];

			await invoke("format_partitions", {
				partitions,
			});

			setStep("Installing new system");
			setValue(40);
			setLongStep(true);
			// await sleep(30000);
			await invoke("unpackfs");

			setStep("Configuring new system");
			setValue(80);
			setLongStep(false);
			// await sleep(10000);
			await invoke("config_root");

			setValue(100);
			setInstalling(false);
			setDone(true);
		} catch (error) {
			setInstallerErrors(JSON.stringify(error));
			setInstalling(false);
		}
	}

	useEffect(() => {
		if (longStep) {
			const interval = setInterval(() => {
				if (value < 80) {
					setValue(value + 1);
				} else {
					clearInterval(interval);
				}
			}, 3000);
			return () => clearInterval(interval);
		}
	}, [longStep, value]);

	if (status === "pending") {
		return <div>Loading</div>;
	}

	if (status === "error") {
		return <div>{error.message}</div>;
	}

	return (
		<div className="w-screen h-screen overflow-hidden">
			<Globe className="scale-200 top-[60vh] -z-40" />
			<div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
			<div className="w-screen h-screen relative flex flex-col place-items-center place-content-center">
				<div className="flex flex-col gap-6 pb-20">
					<img src="/koompi-letter.png" alt="" className="h-14" />
					<h1 className="font-medium text-2xl text-center">OS 2025</h1>
				</div>

				{done ? (
					<div className="w-full max-w-lg bg-background/95 backdrop-blur-3xl p-10 rounded-2xl space-y-8">
						<h2 className="font-black text-3xl">Success</h2>
						<p className="font-normal">
							Installation completed. You may need to reboot your system now to
							complete the final setup.
						</p>
						<Button
							className="w-full"
							onClick={async () => await invoke("reboot")}
						>
							Reboot
						</Button>
					</div>
				) : installing ? (
					<div className="w-full max-w-lg bg-background/95 backdrop-blur-3xl p-10 rounded-2xl space-y-6 flex flex-col place-items-center place-content-center">
						<AnimatedCircularProgressBar
							max={100}
							min={0}
							value={value}
							gaugePrimaryColor="rgb(79 70 229)"
							gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
						/>
						<p>{step}</p>
					</div>
				) : installErrors !== "" ? (
					<code>
						<pre>Error: {installErrors}</pre>
					</code>
				) : (
					<div className="w-full max-w-lg bg-background/95 backdrop-blur-3xl p-10 rounded-2xl space-y-6">
						<div className="space-y-2">
							<h2 className="font-black">Select Disk</h2>
							{data.blockdevices
								.filter(
									(block) =>
										block.type === "disk" &&
										block.size.includes("G") &&
										parseFloat(block.size.replace("G", "")) > 32 &&
										(block.name.startsWith("nvme") ||
											block.name.startsWith("sd") ||
											block.name.startsWith("mmc"))
								)
								.map((block) => (
									<Label
										className="border p-2 rounded-sm flex place-content-between"
										key={block.name}
									>
										<div className="flex gap-2 place-items-center">
											<Checkbox
												checked={config.disk === block.name}
												onCheckedChange={(checked) => {
													if (checked) {
														setConfig({
															...config,
															disk: block.name,
														});
													}
												}}
											/>{" "}
											<div className="flex flex-col gap-1">
												<span>{block.model}</span>
												<span>/dev/{block.name}</span>
											</div>
										</div>
										<span>{block.size}</span>
									</Label>
								))}
						</div>

						<div className="space-y-2">
							<h2 className="font-black">Partition Table</h2>
							<Label className="border p-2 rounded-sm flex place-content-between">
								<span>/boot/efi</span>
								<div className="space-x-4">
									<span>1%</span>
									<span>ext4</span>
								</div>
							</Label>
							<Label className="border p-2 rounded-sm flex place-content-between">
								<span>/</span>
								<div className="space-x-4">
									<span>30%</span>
									<span>ext4</span>
								</div>
							</Label>
							<Label className="border p-2 rounded-sm flex place-content-between">
								<span>/home</span>
								<div className="space-x-4">
									<span>69%</span>
									<span>ext4</span>
								</div>
							</Label>
						</div>

						<Button
							className="w-full bg-primary"
							onClick={install}
							disabled={config.disk === ""}
						>
							INSTALL
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
