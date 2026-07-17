import HomepageRuntimeState from "@/components/homepage/HomepageRuntimeState";
import type { HomepageRuntimeSection, HomepageTemplateKey } from "@/types/homepage-runtime";
import { templates } from "@/templates/registry";

import SaqsoBuildHome from "@/templates/saqsobuild/HomeTemplate";

type Props = {
  template: HomepageTemplateKey;
  sections: HomepageRuntimeSection[];
  emptyMessage?: string;
};

export default function TemplateRenderer({ template, sections, emptyMessage }: Props) {
  if (template === "saqsobuild") {
    return <SaqsoBuildHome sections={sections} emptyMessage={emptyMessage} />;
  }

  const TemplateComponent = templates[template];

  if (!TemplateComponent) {
    return (
      <HomepageRuntimeState
        title="Template unavailable"
        message="The configured homepage template is not installed."
      />
    );
  }

  return <TemplateComponent />;
}
