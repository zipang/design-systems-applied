import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import type * as React from "react";

/** Foundation shell. Replaced by the full visualizer shell in Phase 4. */
export const App: React.FC = () => (
	<main>
		<Heading level={1}>DS Visualizer</Heading>
		<Text>Design token editor built on the Applied Design System.</Text>
	</main>
);
