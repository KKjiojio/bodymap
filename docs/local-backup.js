/* Construct a ZIP containing the exact PNG data URLs sent to the collector. */
(function (root) {
  'use strict';
  const encoder = new TextEncoder();
  const table = Array.from({length:256}, (_, n) => { for (let i=0;i<8;i++) n=(n&1)?(0xedb88320^(n>>>1)):(n>>>1); return n>>>0; });
  function crc32(bytes) { let crc=0xffffffff; for (const byte of bytes) crc=table[(crc^byte)&255]^(crc>>>8); return (crc^0xffffffff)>>>0; }
  function bytesFromPng(url) { const raw=atob(url.slice(url.indexOf(',')+1)); return Uint8Array.from(raw, c=>c.charCodeAt(0)); }
  function header(size, values) { const buf=new Uint8Array(size), view=new DataView(buf.buffer); for (const [offset,value,width] of values) width===2?view.setUint16(offset,value,true):view.setUint32(offset,value,true); return buf; }
  function buildZip(files) {
    const local=[], central=[]; let offset=0;
    for (const file of files) {
      const name=encoder.encode(file.name), data=file.data, crc=crc32(data);
      const localHeader=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,crc,4],[18,data.length,4],[22,data.length,4],[26,name.length,2]]);
      const centralHeader=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,crc,4],[20,data.length,4],[24,data.length,4],[28,name.length,2],[42,offset,4]]);
      local.push(localHeader,name,data); central.push(centralHeader,name); offset+=localHeader.length+name.length+data.length;
    }
    const centralSize=central.reduce((sum,part)=>sum+part.length,0);
    const end=header(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,centralSize,4],[16,offset,4]]);
    return new Blob([...local,...central,end],{type:'application/zip'});
  }
  root.downloadSectionBackup = function (section, participantId, result, images) {
    const id=(participantId||'anonymous').replace(/[^a-zA-Z0-9_-]/g,'_');
    const files=[{name:'responses.json',data:encoder.encode(JSON.stringify(result,null,2))}];
    for (const image of images) {
      const prefix='trial_'+String(image.trial).padStart(2,'0');
      if(image.bodyMapPng) files.push({name:prefix+'_body_map.png',data:bytesFromPng(image.bodyMapPng)});
      if(image.stepMapPng) files.push({name:prefix+'_steps.png',data:bytesFromPng(image.stepMapPng)});
    }
    const url=URL.createObjectURL(buildZip(files)), link=document.createElement('a');
    link.href=url; link.download=id+'_section_'+section+'_backup.zip'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
})(window);
