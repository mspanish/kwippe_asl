var getMathml=function(){
    return buffer.innerHTML.replace(/ id=[^>]*/g,'');
};
var latexMathml=[
    ["\\infty","∞"],["\\Delta","Δ"],["\\alpha","α"],["\\beta","β"],["\\gamma","γ"],["\\theta","θ"],["\\lambda","λ"],["\\mu","µ"],["\\pi","π"],["\\sigma","σ"],["\\phi","ϕ"],
    ["\\sum","∑"],["\\int","∫"],["\\lim","lim"],["\\log","log"],["\\sin","sin"],["\\cos","cos"],["\\tan","tan"],
    ["\\neq","≠"],["\\geq","≥"],["\\leq","≤"],["\\in","∈"],["\\rightarrow","→"],["\\forall","∀"],["\\exists","∃"],
    ["\\pm","±"],["\\times","×"],["\\div","÷"],["\\ldots","…"],["\\}","}"],["\\{","{"]
];

var mathml2latex = new Map();

for(let pair of latexMathml){
    mathml2latex.set(pair[1],pair[0]);
}
var encodeLatex=function(root){
    var type=root.tagName.toLowerCase();
   
   if(type=='msub'){
        return encodeLatex(root.children[0])+'_{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msup'){
        return encodeLatex(root.children[0])+'^{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msubsup'){
        return encodeLatex(root.children[0])+'_{'+encodeLatex(root.children[1])+'}^{'+encodeLatex(root.children[2])+'}';
    }else if(type=='mfrac'){
        return '\\frac{'+encodeLatex(root.children[0])+'}{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msqrt'){
        return '\\sqrt{'+encodeLatex(root.children[0])+'}';
    }else if(type=='mroot'){
        return '\\sqrt['+encodeLatex(root.children[1])+']{'+encodeLatex(root.children[0])+'}';
    }else if(type=='mi'||type=='mo'||type=='mn'){
        if(mathml2latex.has(root.textContent)){
            return mathml2latex.get(root.textContent)+' ';
        }else{
            return root.textContent;
        }
    }else{
        var code='';
        for(var j=0;j<root.childElementCount;j++){
            code+=encodeLatex(root.children[j]);
        }
        return code;
    }
};

var getLatex=function(){
    let buffer = document.getElementById('hidden')
    return encodeLatex(buffer.firstElementChild);
};

export { getLatex }
