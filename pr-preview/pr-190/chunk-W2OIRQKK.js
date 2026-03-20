import{a as m}from"./chunk-UMKXEDDR.js";import{F as t,G as n,H as s,W as e,_ as c,db as l,t as a,v as r}from"./chunk-DZHK45N5.js";import"./chunk-DAQOROHW.js";var u=(()=>{class o{static{this.\u0275fac=function(i){return new(i||o)}}static{this.\u0275cmp=r({type:o,selectors:[["app-signal-to-iterator-page"]],decls:11,vars:4,consts:[["fnName","signalToIterator"],[1,"inline"],[1,"mb-1","text-xl","text-secondary"],["language","typescript"]],template:function(i,d){i&1&&(s(0,"app-member-page-header",0),t(1,"p"),e(2," This converts a signal into an AsyncIterator. The emissions from the signal will build up, and then released each time next is called. The iterator can be used in a "),t(3,"code",1),e(4,"for async"),n(),e(5,` loop. This uses an effect under the hood, so be sure to pass injector if it isn't created in the constructor.
`),n(),t(6,"div")(7,"h3",2),e(8,"Example"),n(),t(9,"app-code-block",3),e(10),n()()),i&2&&(a(10),c(`
const source = signal('start');
// if not in constructor then pass injectorRef.
for await (const item of signalToIterator(source, `,"{"," injector: this.injectorRef ","}",")) ","{",`
  console.log(item); // 'start', 'next'...
`,"}",`
const source = signal('next');
  `))},dependencies:[l,m],encapsulation:2,changeDetection:0})}}return o})();export{u as SignalToIteratorPageComponent};
