import type * as React from "react";
import { PageBody } from "../layout/PageBody";
import { ComponentsDemo } from "./ComponentsDemo";

/** The components page: the library gallery scrolls in the page body. */
export const ComponentsPage: React.FC = () => (
	<PageBody>
		<ComponentsDemo />
	</PageBody>
);
