import { codeToHtml} from "shiki";
interface  CodeBlockProps {
    code:string;
    lang:string;
}
export default async function CodeBlock({code,lang}:CodeBlockProps) {
    const html = await codeToHtml(code,{
            lang:lang,
            theme:'vitesse-dark'
        }
    )
     return(
        <div dangerouslySetInnerHTML={{__html:html }}/>
    );
}