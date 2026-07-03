import { templates } from "@/templates/registry";

type Props = {
  template: keyof typeof templates;
};

export default function TemplateRenderer({
  template,
}: Props) {
  const TemplateComponent =
    templates[template];

  if (!TemplateComponent) {
    return (
      <div className="p-6 text-center text-red-500">
        Template "{template}" not found.
      </div>
    );
  }

  return <TemplateComponent />;
}

