// blacklist markets & events by network id then branch id

// initialize blacklists with network ids
var markets = { '0': {}, '7': {}, '10101': {} };
var events = { '0': {}, '7': {}, '10101': {} };

// [ network id ][ branch id ]
markets['0']['1010101'] = [
    "7960c1fb48ac30c060c143666520ac11822a7337a0fe86807ea73675c4b7b65",
    "82a2883b413003b790398230f1793a49b66f51190ff0a64bf37ff0feec1e458",
    "8a36bb791ceb1d80da3bbe6b02a55030bb0c5d8233e7d2b8e9742d2b1ac4a1b",
    "-679dd23af25d5053c639e2f17789cc4838a8bbef7fc4275e2e4f6ba59b365ab",
    "-baecbd5912a5365e499c58f66d8a7b0362b139ff55d766c00194bdf255762fb0",
    "-9d16373030c5ee68f4df240edfae9ed3ad853fbaef21a757e879527be03f71b",
    "-5bfeea0efc754add5e4d11d8a57666f5210a7f5d46437e406b127971b28ac381",
    "-144a8d4b00f0ec1d5b2ac030c23c39e8e99acdc91ff37d8298380c9eb4bdf8d4",
    "-7c3e6010123bff906d24b946dce575ee854c02fc895e7d0b1a6e0c1cda1de64d",
    "-81635174e39d2ddf7e978e7891ecdba821fd3cae44e0351f64c8dedc383bb771",
    "-78e4a8b5dbd3a013a42cf8976654045ad1614e2882515791ba43876922b37802",
    "-e055740a84abada89dfc997cb33083f24f1fd2d5788088888d3f41febaece0c5"
];

markets['7']['1010101'] = [
    "-7c3e6010123bff906d24b946dce575ee854c02fc895e7d0b1a6e0c1cda1de64d",
    "7960c1fb48ac30c060c143666520ac11822a7337a0fe86807ea73675c4b7b65",
    "82a2883b413003b790398230f1793a49b66f51190ff0a64bf37ff0feec1e458",
    "8a36bb791ceb1d80da3bbe6b02a55030bb0c5d8233e7d2b8e9742d2b1ac4a1b",
    "-679dd23af25d5053c639e2f17789cc4838a8bbef7fc4275e2e4f6ba59b365ab",
    "-baecbd5912a5365e499c58f66d8a7b0362b139ff55d766c00194bdf255762fb0",
    "-144a8d4b00f0ec1d5b2ac030c23c39e8e99acdc91ff37d8298380c9eb4bdf8d4",
    "-81635174e39d2ddf7e978e7891ecdba821fd3cae44e0351f64c8dedc383bb771",
    "-e055740a84abada89dfc997cb33083f24f1fd2d5788088888d3f41febaece0c5",
    "-77ddf3f672cef175a4642a215fde1435fb2ffe8593bbc0ce46cbdaade523bca4",
    "-a76f6c46ae32417b52be6fbd811c317209bafd7d090b2b607ecf57fa8fb87d57",
    "-7fef80c02ff8508dac301510863f1cb982b3841c1ae01ccc5cab3e0d023a06d2",
    "-2ecd1bd09e58c933470e17ec06d0e231fee40115bac918620ceccdcd7f46859c",
    "-733d0f0d6f0422f1aaac130fc8009019163753bfdd8446006b4313465a5a4023",
    "-3d0f7ced9b591d476b1711b2145d932f9fad7524eced56156f54e3ff250f87ec",
    "-d71810e303d9e37f5c83ee31dd87e2d5eac4a6d25b65d38d9e2c2ce447e6e93a",
    "-c4872f12af3bc570d53a9194e926ca0e97d730ddadd06b0c5b1d687e430056f7",
    "-2a17e7f100b030c6a2a6666a1d43f82a3c554c22cbcd27f639be47466687a5cb",
    "-c716909c9f66770f3b90ee904f043f33a1c282c179506e8ad3d982fd611ae26",
    "-7eb9fde28c41896064ae43332f5a4697044cf40302486f668e658a2ed462103d",
    "-36888da57ede86fa9a176244da7c5840bf929bf4b0d2543e85e7d09630f0d600",
    "-9b241692291951b3192c03f510d744c324bf3e75b3ceb6ecd6d53515c0673055",
    "-5bfeea0efc754add5e4d11d8a57666f5210a7f5d46437e406b127971b28ac381",
    "-9d16373030c5ee68f4df240edfae9ed3ad853fbaef21a757e879527be03f71b",
    "-ab2016b7972c2fd2af4b0314a055b0f9e01a3ad49c25153791b38b28e79a14ca",
    "-73c0b7672f60a408fc5c6e78fd92d7d47d5b5a8eb81e1e37a1294facf67124b2",
    "-18d7c4525406022ecb4b4f84731bb5e05ad9bb6660d5aeb3c7730eeded821e54",
    "-98df00be25b74342af823dd1cbacaf6be969a56860febea1fcac6fd6f4cb9a36",
    "-869d9efc122d60398bb325a8ee427ff3b973ef47dc8a977f340814c785bd4594",
    "-aa4173568a8b24f90b996386af2fd4375ba17843bcf266e401c996495feea4b6",
    "-52d62f65ab698e2bd0c865ceeedd0633845042234cc0d821ba0433a6f63faef5",
    "-7eb6551c0c791cb6520a4a064cf21a05eba23198590c30e70434afa7ade550bb",
    "-efbcf041916d1828787b359858030221fd14a71ea00ef758fd01dda5054ccad8",
    "-57b3ed3225cb9707811850f66a1f4486d536d6aab7f32b246ff7740f9c30bac0",
    "-ca5531accc905495fa6bc0facc8006146929ab1830529a0a1cbe622b776678b8",
    "-3c8b476a74b3c5d83be24f39d0383c77977d7364492881c525fa73655bc5eb55",
    "-70abe985545b9336fa2e1ebac322f933e19e2953327f3f5570ca8f77a3be0fcf",
    "-c9fc85cf8e0c4966d7be500c20643a98086e42d95d8fa2449e601ca0db50889d",
    "-32d3b39cd84d866502e1241ac03598946e5551a5bc53d2b1a69f2a0c3ee650aa",
    "-abe6842e868760d3736ca78010201c1c57aaae6a19cb5648292f74f661dea8d3",
    "-cd72bd65d058b7675b43be47cd9c3aecfc752884810f339a76fcb1165c737028",
    "-dd4cb96c15ebcb16b0167fe0d6f2cf433908996e1a42a11d5631a201ece805d1",
    "-36e58e9b9e3929962b98b4fde87738e12788a40b20ea10646da06e83e7bff792",
    "-c98b93661d72eacc5b476fdbd691620cafff3ae340f79e8760a88242e0d9243f",
    "-e74f2af1ef64fcb82d5ee8a542be0e917bc6e41607a37e5ec5d29e16cf3516f3",
    "-754ab0e368c1c84227c5b6a9949a43407b94ed9262aa857d0cfed46b9a416ff9",
    "-10c3873a4b8aec5b22a31f3ef37df6c396450304e1806370f60835a9b4c198b2",
    "-5d3d342b95de906cbb2bd86177a58d2bbe82517853c50536b3366fc61c89efa7",
    "-27928c18ad216662bd78dffa690ec7590f76e12848ca04c872707e53ef8b2626",
    "-6c689efdcf250cef483758113bff89edad44d8a5e7709f1c0d2a4198945d8b2f",
    "-6556ac70f3c3805f33087baf29cc7f3033b5c19332154128c6e1d9a4cc7a23e8",
    "-7f9c4d76d3f4e243662bf24c1ca8f056511c711eb894d96afa7950ea52561519",
    "ca7c2f7b3b57345c4fc6bb24f6b22371b96753696251800b2f351f6857b8719",
    "-e98ed7b612f80a2fca24b262142b7f5d0165d9d5aef3556969be2333cd4a98dc",
    "-3c58fb2fc66bd6602d8a891ab4c47ee1579e07ab62fb2abb5e7d497dc82c9e7a",
    "-8f42c9e93037f7d53a15d5882f8fddc42d5ffc8314a1efb92f4a8098f5af957f",
    "-da9df6bb49a9aa89be35fb4e0dc51faa6d7be20ed238a6e98eee3f86f071a873",
    "-88d7529d64f01f31151555139c86fbce4b6a8a203eb2b1c6f41b4a45b97aa3d4",
    "a2354539fc7a530fd7b398968be056532ea8d4fbcafd37a663d5ef15a769deb"
];

markets['10101']['1010101'] = [];

module.exports = {
	markets: markets,
	events: events
};
