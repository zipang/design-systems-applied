import type * as React from "react";
import { useState } from "react";
import { Heading } from "./components/base/Heading";
import { Text } from "./components/base/Text";
import { Container } from "./components/layout/Container";
import { Grid } from "./components/layout/Grid";
import { HStack } from "./components/layout/HStack";
import { VStack } from "./components/layout/VStack";
import { Avatar } from "./components/ui/Avatar";
import { Button } from "./components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/Dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "./components/ui/DropdownMenu";
import { TextField } from "./components/ui/TextField";

/**
 * Temporary gallery that exercises every core primitive. The chat UI replaces it in
 * Phase 4 (T0002).
 */
export const App: React.FC = () => {
	const [name, setName] = useState("");

	return (
		<Container as="main">
			<VStack gap="lg">
				<HStack justify="between">
					<Heading level={1}>Radix UI Starter</Heading>
					<HStack gap="sm">
						<Avatar fallback="EL" size="sm" />
						<DropdownMenu>
							<DropdownMenuTrigger>Menu</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onSelect={() => setName("")}>Reset</DropdownMenuItem>
								<DropdownMenuItem disabled>Disabled</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</HStack>
				</HStack>

				<Grid columns={2} gap="lg">
					<VStack gap="sm">
						<Heading level={3}>Typography</Heading>
						<Text>Body copy on the token scale.</Text>
						<Text size="sm" tone="muted">
							Muted secondary text.
						</Text>
					</VStack>
					<VStack gap="sm">
						<Heading level={3}>Controls</Heading>
						<TextField
							id="name"
							label="Name"
							value={name}
							onChange={setName}
							placeholder="Type here"
						/>
						<HStack gap="sm">
							<Button label="Primary" />
							<Button label="Secondary" variant="secondary" />
							<Button label="Loading" loading />
							<Button label="Disabled" disabled />
						</HStack>
						<Dialog>
							<DialogTrigger>Open dialog</DialogTrigger>
							<DialogContent title="Dialog title" description="A token-styled modal.">
								<Button label="Confirm" />
							</DialogContent>
						</Dialog>
					</VStack>
				</Grid>
			</VStack>
		</Container>
	);
};
