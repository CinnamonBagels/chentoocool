var pg = require('pg');

var cstream;
var conn = 'postgres://cogsci_121_1:Lj9vQnwMVikW@delphidata.ucsd.edu:5432/delphibetadb';

pg.connect(conn, function(err, client, done) {
	if(err) console.log(err);
	if(client) console.log(client);
	done();
});
	// cstream = csv({
	// 	headers : true
	// }).on('data', function(data) {
	// 	if(data.State === 'CA' && data.City === 'San Diego') {
			
	// 	}
	// 	process.exit();
	// });
	//stream.pipe(cstream);