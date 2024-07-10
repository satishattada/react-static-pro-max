import path from "path";
import fs from "fs-extra";
import { chunkNameFromFile } from "../utils/chunkBuilder";

export default async (state) => {
  const {
    config: { paths },
    templates,
  } = state;

  const file = `
${`

// Template Map
export default {
  ${templates
    .map((template) => `'${template}': require('${template}').default`)
    .join(",\n")}
}

export const notFoundTemplate = '${templates[0]}'
`}
`;

  const dynamicRoutesPath = path.join(process.env.REACT_STATIC_TEMPLATES_PATH);
  await fs.remove(dynamicRoutesPath);
  await fs.outputFile(dynamicRoutesPath, file);

  // We have to wait here for a smidge, because webpack watcher is
  // overly aggressive on first start
  // await new Promise(resolve => setTimeout(resolve, 500))

  return state;
};
