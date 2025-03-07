import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<QueryClientProvider client={queryClient}>
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</QueryClientProvider>
	</BrowserRouter>
);
