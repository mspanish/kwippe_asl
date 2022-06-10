
const processColl = (decoded,code) => {
   //  console.log('got decoded for '+code+ ' '+ JSON.stringify(decoded))
    let content = decompressFromUTF16(decoded.f);
    content = content.split(',');
    content = uniq(content);

    if (!content) {
        //console.log('sorry we dont have this pack!' + code)
        return
    }
    let vals = store.get();
    let collLoaded = vals.coll;
    changeCollection(code, collLoaded,content)    
};

const processColls = (decoded) => {
    let collsArray = decompressFromUTF16(decoded);
    collsArray = JSON.parse(collsArray)
    /* TODO: this cleans up our names to add them to the list, but 
    we need to put these in actually categories later */
    
    for (var i = 0; i < collsArray.length; i++) {
        let name = collsArray[i].name;
        if (name.includes('-')) {
            name = name.split('-')
            collsArray[i].name = name[1]
        }
        //console.log('name of coll is '+collsArray[i].name)
    }
    //console.log('colls are '+collsArray);
    //store.set({ collections: collsArray, fetched: true });
   // console.log('got all the colls')
    //   connect(this, store, mapToProps);
    // the first coll 'imp' is reserved for imports
    //this.set({ collections: collsArray })
    //  //store.set({ collections:collections, fetched: true });
    ////store.set({colls:colls, licenseGroups:licenseGroups})
    addCollectionsData()    
};

const addCollectionsData = () => {

    let colls = ['imp', 'sko',
        'lor', 'del', 'win',
        'kwi', 'awe', 'ion',
        'chr', 'emo', 'osm',
        'mat', 'pic',
        'web', 'vaa', 'not',
        'fir', 'noc', 'xei',
        'lug', 'met', 'wav',
        'pap', 'ibm', 'bri',
        'sli', 'roc', 'jqu',
        'cry', 'lib', 'map',
        'mon', 'gue', 'mul',
        'ara', 'bat', 'io2',
        'ele', 'lin', 'ico',
        'typ', 'the', 'em2',
        'twe', 'ore',
        'her', 'ofl', 'kal',
        'rob', 'icf', 'oa1',
        'jqe', 'tw2', 'knl',
        'gli', 'ga2', 'opg',
        'pat'
    ];  //'ssj', 'ope'
    //vex.defaultOptions.className = 'vex-theme-flat-attack'
    /* this object is so we can stop stuff loading once it's already been
    fired by the lazy loader - but it's already in the pipeline of retrieving teh binary, etc
    if the keyword has been kaboshed we can check this object to see and cancel at
    a later stage in the process */
    // App.lazyQueue = {};
    let licenseObj = {};
    let licenseGroups = {};
    // careful with this! make sure the user sets this manually, and has an easy way to UNSET it, as well as a reminder that they are excluding certain collections...
    let licensesProhibited = [];
    let licensesActive = true;
    let licensesColorActive = false;

    /* this specifies whether or not you vary the colors so you have more variety when clicking through
    to designer on a complex piece, or whether you only take from the color palette at hand */
    let useItemColors = true;


    licenseGroups.pd = ['opg', 'ga2', 'ico', 'ope', 'ore', 'osm', 'ssj', 'ofl', 'oa1', 'gli', 'knl']
    licenseGroups.cc = ['icf', 'fir', 'tw2', 'jqe', 'twe', 'del', 'sko', 'lor', 'emo', 'em2', 'gue', 'her', 'ibm', 'lin', 'mul', 'pap', 'roc', 'web', 'win'];

    for (var i = 0; i < colls.length; i++) {
        let i_coll = colls[i];
        if (licenseGroups['cc'].includes(i_coll)) {
            // we have a CC licensed coll push to licenseObj
            licenseObj[i_coll] = 'cc';
        }
        if (licenseGroups['pd'].includes(i_coll)) {
            // we have a PD licensed coll push to licenseObj
            licenseObj[this_coll] = 'pd';
        }
        if (!licenseGroups['pd'].includes(i_coll) && !licenseGroups['cc'].includes(i_coll)) {
            // we have an open source licensed coll push to licenseObj
            licenseObj[i_coll] = 'os';
        }
    } // end for    

    //store.set({ licenseGroups: licenseGroups, useItemColors: useItemColors, licensesColorActive: licensesActive, licensesProhibited: licensesProhibited });
};   

export {processColl, processColls, addCollectionsData }