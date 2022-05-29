export default function (docs) {
    let ans = ''
    // console.log(docs);
    docs.forEach((doc) => {
        if (doc.type == 'function') {
            ans += `## Function： ${doc.id}\n`
            if (doc.description)
                ans += `#### Description：\r\n > ${doc.description}\r\n`
            ans += `#### Params：${doc.params.map(p => `\`${p.name}\`：(\`${p.typeAnnotation}\`)`).join(';')}\n`
            ans += `#### ReturnType：\`${doc.returnType}\`\r\n`
        }
        if (doc.type == 'class') {
            ans += `## Class: ${doc.id}\r\n`
            if (doc.description)
                ans += `#### Description：\r\n > ${doc.description}\r\n`
            ans += '#### Body：\r\n'
            let body = ''
            doc.body.forEach((inner) => {
                // console.log(inner);
                if (inner.type == 'classProperty') {
                    body += `- **(Property)** \`${inner.id}\`：\`${inner.typeAnnotation}\`\r\n`
                }
                if (inner.type == 'classMethod') {
                    body += `- **(Method)** ${inner.id} \r\n`
                    if (inner.params.length > 0)
                        body += `Params：${inner.params.map(p => `\`${p.name}\`：(\`${p.typeAnnotation}\`)`).join(';')}\r\n`
                    body += `ReturnType：\`${inner.returnType}\`\r\n`
                }
            })
            ans += body

        }
    })
    return ans

}