import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const boardUrl = new URL('../apps/web-sveltekit/src/lib/og/BoardOgCard.ts', import.meta.url);
const source = readFileSync(boardUrl, 'utf8').replace("'image-size'", JSON.stringify(import.meta.resolve('image-size'))).replace("'./PageOgCard'", JSON.stringify(new URL('./PageOgCard.ts', boardUrl).href));
const compiled = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { boardOgCard } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const props = {accent:'#2563eb',accentSoft:'#eff6ff',border:'#dbeafe',label:'Post',author:'Mike',date:'Nov 11, 2026'};
function nodes(node) { return [node, ...(Array.isArray(node?.props?.children) ? node.props.children.flatMap(nodes) : [])]; }
test('long multilingual posts retain their complete body and grow instead of clipping', () => {
 const body = ('A thought with a newline.\n日本語も全部読める。\n').repeat(30);
 const card = boardOgCard({...props,body});
 assert.ok(nodes(card).some(node => node?.props?.children === body));
 assert.ok(card.props.style.height > 630);
 assert.ok(!nodes(card).some(node => node?.props?.style?.overflow === 'hidden'));
});
test('artwork previews preserve the full image and deduplicate attachments', () => {
 const card = boardOgCard({...props,body:'My drawing',imageUrls:['/one.png','/one.png','/two.png']});
 const images = nodes(card).filter(node => node.type === 'img');
 assert.equal(images.length,2);
 assert.ok(images.every(node => node.props.style.objectFit === 'contain'));
});

test('short cards stay vertically centered with left-aligned text and blank drawings get a caption', () => {
 const short = boardOgCard({...props,body:'hello!'});
 assert.equal(short.props.style.alignItems,'center');
 assert.equal(short.props.children[0].props.style.textAlign,'left');
 assert.equal(short.props.children[0].props.children[0].props.style.justifyContent,'flex-start');
 const long = boardOgCard({...props,body:'A longer post. '.repeat(60)});
 assert.equal(long.props.style.alignItems,'flex-start');
 const drawing = boardOgCard({...props,label:'Drawing',body:'   ',imageUrl:'/drawing.png'});
 assert.ok(nodes(drawing).some(node => node?.props?.children === 'drew a thing!'));
});

test('individual card palettes can vary independently of unchanged post text', async () => {
 const { randomOgPalette } = await import('../apps/web-sveltekit/src/lib/og/PageOgCard.ts');
 const choices = [0, .2, .4, .6, .8].map(value => randomOgPalette(() => value));
 assert.equal(new Set(choices.map(choice => choice.background)).size, 5);
 assert.ok(choices.every(choice => choice.accent !== choice.background));
});

test('post identities retain distinct stable palettes and varied image layouts', () => {
 const cards = Array.from({length:100},(_,i)=>boardOgCard({...props,colorKey:`post:${i}`,body:'A drawing',imageUrl:'/image.png'}));
 assert.equal(new Set(cards.map(card=>`${card.props.style.background}:${card.props.style.color}`)).size,100);
 assert.ok(new Set(cards.flatMap(nodes).filter(node=>node.type==='img').map(node=>node.props.style.width)).size>10);
 assert.equal(boardOgCard({...props,colorKey:'same',body:'first'}).props.style.background,boardOgCard({...props,colorKey:'same',body:'edited'}).props.style.background);
});
