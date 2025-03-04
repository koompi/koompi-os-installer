import {
	Bell,
	Check,
	Globe,
	Home,
	Keyboard,
	Link,
	Lock,
	Menu,
	MessageCircle,
	Paintbrush,
	Settings,
	Video,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "./ui/sidebar";
import { Outlet } from "react-router";

const data = {
	nav: [
		{ name: "Notifications", icon: Bell },
		{ name: "Navigation", icon: Menu },
		{ name: "Home", icon: Home },
		{ name: "Appearance", icon: Paintbrush },
		{ name: "Messages & media", icon: MessageCircle },
		{ name: "Language & region", icon: Globe },
		{ name: "Accessibility", icon: Keyboard },
		{ name: "Mark as read", icon: Check },
		{ name: "Audio & video", icon: Video },
		{ name: "Connected accounts", icon: Link },
		{ name: "Privacy & visibility", icon: Lock },
		{ name: "Advanced", icon: Settings },
	],
};

export function MainLayout() {
	return (
		<SidebarProvider className="items-start w-full h-dvh">
			<Sidebar collapsible="none" className="hidden md:flex">
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{data.nav.map((item) => (
									<SidebarMenuItem key={item.name}>
										<SidebarMenuButton
											asChild
											isActive={item.name === "Messages & media"}
										>
											<a href="#">
												<item.icon />
												<span>{item.name}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<main className="flex flex-1 flex-col overflow-hidden">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
