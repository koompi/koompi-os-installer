import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import Oem from "./Oem";
import Installer from "./Installer";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/magicui/globe";

export default function Home() {
	const { data, status } = useQuery({
		queryKey: ["mode"],
		queryFn: async () => {
			return (await invoke("get_mode")) as string | null;
		},
		staleTime: Infinity,
	});

	if (status === "pending") {
		return (
			<div className="w-screen h-dvh overflow-hidden">
				<Globe className="scale-200 top-[60vh] -z-40" />
				<div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
				<div className="w-screen h-screen relative flex flex-col place-items-center place-content-center">
					<div className="flex flex-col gap-6 pb-20">
						<img src="/koompi-letter.png" alt="" className="h-14" />
						<h1 className="font-medium text-2xl text-center">OS 2025</h1>
					</div>
				</div>
			</div>
		);
	}

	if (data === "oem") {
		return <Oem />;
	}

	if (data === "installer") {
		return <Installer />;
	}

	return (
		<div className="w-screen h-screen overflow-hidden relative">
			<Globe className="scale-200 top-[60vh] -z-40" />
			<div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
			<div className="w-screen h-screen relative flex flex-col place-items-center place-content-center">
				<div className="flex flex-col gap-6 pb-20">
					<img src="/koompi-letter.png" alt="" className="h-14" />
					<h1 className="font-medium text-2xl text-center">OS 2025</h1>
				</div>
				<div className="w-full max-w-lg bg-background/95 backdrop-blur-3xl p-10 rounded-2xl space-y-8">
					<h2 className="font-black text-3xl">ERROR</h2>
					<p className="font-normal">
						Invalid MODE. MODE must be set as "oem" or "installer"
					</p>
					<Button
						className="w-full"
						onClick={async () => await invoke("reboot")}
					>
						Reboot
					</Button>
				</div>
			</div>
		</div>
	);
}
