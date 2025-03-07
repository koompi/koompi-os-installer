import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Globe } from "@/components/magicui/globe";

export default function Oem() {
	const [account, setAccount] = useState({
		name: "",
		passwd: "",
		confirm: "",
	});

	async function setup() {
		await invoke("create_account", {
			user: account.name,
			passwd: account.passwd,
		});
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
				<div className="w-full max-w-lg bg-background/95 backdrop-blur-3xl p-10 rounded-2xl space-y-8">
					<div className="space-y-2">
						<h2 className="font-black">Account Setup</h2>
						<p>Let's create your user account.</p>
						<Input
							onChange={(e) => setAccount({ ...account, name: e.target.value })}
							placeholder="User"
							value={account.name}
						/>
						<Input
							onChange={(e) =>
								setAccount({ ...account, passwd: e.target.value })
							}
							placeholder="Password"
							value={account.passwd}
						/>
						<Input
							onChange={(e) =>
								setAccount({ ...account, confirm: e.target.value })
							}
							placeholder="Confirm password"
							value={account.confirm}
						/>
					</div>

					<Button
						className="w-full bg-primary"
						onClick={setup}
						disabled={
							account.name === "" ||
							account.passwd.length < 3 ||
							account.passwd !== account.confirm
						}
					>
						INSTALL
					</Button>
				</div>
			</div>
		</div>
	);
}
