import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { MainLayout } from "./components/Layout";
import Home from "./pages/Page";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<MainLayout />}>
				<Route index element={<Home />} />
			</Route>
		</Routes>
	</BrowserRouter>
);
