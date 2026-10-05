import type * as React from "react";
import { useState } from "react";
import { ChatPanel } from "./components/chat/ChatPanel";
import { ComponentsDemo } from "./components/demo/ComponentsDemo";
import { Container } from "./components/layout/Container";
import { HStack } from "./components/layout/HStack";
import { Button } from "./components/ui/Button";
import { ThemeSwitcher } from "./components/ui/ThemeSwitcher";
import "./App.css";

type View = "chat" | "components";

/**
 * Application shell. Switches between the chat demo and the components demo. Both
 * pages share the theme switcher in the top navigation.
 */
export const App: React.FC = () => {
	const [view, setView] = useState<View>("chat");

	return (
		<div className="app">
			<Container as="nav" width="lg" className="app__nav">
				<HStack gap="sm">
					<Button
						label="Chat"
						size="sm"
						variant={view === "chat" ? "primary" : "ghost"}
						onClick={() => setView("chat")}
					/>
					<Button
						label="Components"
						size="sm"
						variant={view === "components" ? "primary" : "ghost"}
						onClick={() => setView("components")}
					/>
				</HStack>
				<ThemeSwitcher />
			</Container>
			<div className="app__view">
				{view === "chat" ? (
					<Container width="lg" className="app__chat">
						<ChatPanel />
					</Container>
				) : (
					<ComponentsDemo />
				)}
			</div>
		</div>
	);
};
