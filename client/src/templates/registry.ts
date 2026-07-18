import FashionHome from "./fashion/HomeTemplate";
import LuxuryHome from "./luxury/HomeTemplate";
import ModernHome from "./modern/HomeTemplate";
import SaqsoBuildHome from "./saqsobuild/HomeTemplate";
export const templateRegistryManifest=[
{registryKey:"fashion",slug:"fashion",name:"Fashion",version:"1.0.0",sourceType:"BUILT_IN",codePath:"client/src/templates/fashion"},
{registryKey:"luxury",slug:"luxury",name:"Luxury",version:"1.0.0",sourceType:"BUILT_IN",codePath:"client/src/templates/luxury"},
{registryKey:"modern",slug:"modern",name:"Modern",version:"1.0.0",sourceType:"BUILT_IN",codePath:"client/src/templates/modern"},
{registryKey:"saqsobuild",slug:"saqsobuild",name:"SaqsoBuild",version:"1.0.0",sourceType:"BUILT_IN",codePath:"client/src/templates/saqsobuild"}
] as const;
export const templates={fashion:FashionHome,luxury:LuxuryHome,modern:ModernHome,saqsobuild:SaqsoBuildHome} as const;
export function isInstalledTemplate(value:string):value is keyof typeof templates{return Object.prototype.hasOwnProperty.call(templates,value);}
