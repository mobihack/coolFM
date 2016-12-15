$(function(){
	var filemanager = $('.filemanager'),
		breadcrumbs = $('.fmBreadcrumbs'),
		fileList = filemanager.find('.fmData'),
        fileDetails = $('.fileDetails')
        ;


	// Start by fetching the file data from scan.php with an AJAX request
	$('div.loader').show();
	$.getJSON('cache/live-demo.json','json', function(data) {

		var response = [data],
			currentPath = '',
			breadcrumbsUrls = [];
		$('div.loader').hide();
		var folders = [],
			files = [];

		// This event listener monitors changes on the URL. We use it to
		// capture back/forward navigation in the browser.

		$(window).on('hashchange', function(){

			goto(window.location.hash);

			// We are triggering the event. This will execute 
			// this function on page load, so that we show the correct folder:

		}).trigger('hashchange');


		// Hiding and showing the search box

		$('.search').click(function(){

			var search = $(this);

			search.find('span').hide();
			search.find('input[type=search]').show().focus();

		});

		// Listening for keyboard input on the search field.
		// We are using the "input" event which detects cut and paste
		// in addition to keyboard input.

        $('.search').find('input').on('input', function(e){
			folders = [];
			files = [];

			var value = this.value.trim();

			if(value.length) {
                fileDetails.hide('slidedown');
				filemanager.addClass('searching');

				// Update the hash on every key stroke
				window.location.hash = 'search=' + value.trim();

			}

			else {

				filemanager.removeClass('searching');
				window.location.hash = encodeURIComponent(currentPath);

			}

		}).on('keyup', function(e){

			// Clicking 'ESC' button triggers focusout and cancels the search

			var search = $(this);

			if(e.keyCode == 27) {

				search.trigger('focusout');

			}

		}).focusout(function(e){

			// Cancel the search

			var search = $(this);

			if(!search.val().trim().length) {

				window.location.hash = encodeURIComponent(currentPath);
				search.hide();
				search.parent().find('span').show();

			}

		});


		// Clicking on folders

		fileList.on('click', 'div.folders', function(e){
			e.preventDefault();

			var nextDir = $(this).find('a.folders').attr('href');

			if(filemanager.hasClass('searching')) {

				// Building the breadcrumbs

				breadcrumbsUrls = generateBreadcrumbs(nextDir);

				filemanager.removeClass('searching');
				filemanager.find('input[type=search]').val('').hide();
				filemanager.find('span').show();
			}
			else {
				breadcrumbsUrls.push(nextDir);
			}

			window.location.hash = encodeURIComponent(nextDir);
			currentPath = nextDir;
		});

		$('a.closeFileDetails').click(function() {
            fileDetails.hide('slidedown');
            breadcrumbs.show('slidedown');
            fileList.show('slow');

		});

        fileDetails.click(function(event){
			event.stopPropagation();
		});
		fileList.on('click', 'div.files', function(e){
				e.preventDefault();

				var showFile = $(this).find('a.files').attr('href');
				fileList.hide('slow');
            	//breadcrumbs.hide('slow');

				fileData = searchForFile(showFile);

				fileType = fileData.name.split('.'),

					fileType = fileType[fileType.length-1];

				icon = '<span class="fileIcon"><span class="icon file f-'+fileType+'">.'+fileType+'</span></span>';


				fileDataBox=$('.fileBox');
			fileDataBox.html('<h2>File Details</h2>');
			fileDataBox.append('<div class="file-icon-box file-icon-box-files file-icon-ext-'+fileType+' has-text-centered"><span class="file-icon">'+fileType+'</span></div>' +
                '<br style="margin-bottom: 1em">'+fileData.name+'</div>');
			fileDataBox.append('<br><p>Size:'+bytesToSize(fileData.size)+'</p>');
			$('.fileDetails_loader').show();
			$.get('backend.php?type=fileDetails&file='+fileData.path, function(data) {
					fileDataBox.append('<br><p>'+response.filemtime[0]+':'+response.filemtime[1]+'</p>');

				$('.fileDetails_loader').hide('slow');
			});
			fileDataBox.append('<div class="center"><a class="button" style="background-color: #F44336;color: white" href="/?delete&'+fileData.path+'">Delete</a><div>');
            fileDetails.show('slideup');
			});



		// Clicking on breadcrumbs

		breadcrumbs.on('click', 'a', function(e){
			e.preventDefault();

			var index = breadcrumbs.find('a').index($(this));
				if(index==0)
					var nextDir = breadcrumbsUrls;
				else
					var nextDir = breadcrumbsUrls[index];


			breadcrumbsUrls.length = Number(index);

			window.location.hash = encodeURIComponent(nextDir);

		});


		// Navigates to the given hash (path)

		function goto(hash) {
			hash = decodeURIComponent(hash).slice(1).split('=');

			if (hash.length) {
				var rendered = '';

				// if hash has search in it

				if (hash[0] === 'search') {

					filemanager.addClass('searching');
					rendered = searchData(response, hash[1].toLowerCase());
					if (rendered.length) {
						currentPath = hash[0];
						render(rendered);
					}
					else {
						render(rendered);
					}

				}

				// if hash is some path

				else if (hash[0].trim().length) {

					rendered = searchByPath(hash[0]);

					if (rendered.length) {

						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);

					}
					else {
						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);
					}

				}

				// if there is no hash

				else {
					currentPath = data.path;
					breadcrumbsUrls.push(data.path);
					render(searchByPath(data.path));
				}
			}
		}

		// Splits a file path and turns it into clickable breadcrumbs

		function generateBreadcrumbs(nextDir){
			var path = nextDir.split('/').slice(0);
			for(var i=1;i<path.length;i++){
					path[i] = path[i-1]+ '/' +path[i];

			}
			return path;
		}


		// Locates a file by path

		function searchByPath(dir) {
			if(dir==null)
				var path = [];
			else
				var path = dir.split('/');
			var demo = response,
				flag = 0;

			for(var i=0;i<path.length;i++){
				for(var j=0;j<demo.length;j++){
					if(demo[j].name === path[i]){
						flag = 1;
                        demo = demo[j].items;
						break;
					}

				}
			}
			demo = flag ? demo : [];
			return demo;
		}
		function searchForFile(file) {
			
			if(file==null)
				var path = [];
			else
				var path = file.split('/');
			var demo = response,
				flag = 0;
			var fileData;
			for(var i=0;i<path.length;i++){
				for(var j=0;j<demo.length;j++){
					if(demo[j].name === path[i]){
						if(demo[j].type=='file') {
							flag = 1;
							demo=demo[j];
							break;
						}
						else{
							demo = demo[j].items;
						}
					}
				}
				if(flag == 1)
					break;
			}
			return (flag ? demo : []);
		}

		// Recursively search through the file tree

		function searchData(data, searchTerms) {
			data.forEach(function(d){
				if(d.type === 'folder') {

					searchData(d.items,searchTerms);

					if(d.name.toLowerCase().match(searchTerms)) {
						folders.push(d);
					}
				}
				else if(d.type === 'file') {
					if(d.name.toLowerCase().match(searchTerms)) {
						files.push(d);
					}
				}
			});
			return {folders: folders, files: files};
		}


		// Render the HTML for the file manager

		function render(data) {
			var scannedFolders = [],
				scannedFiles = [];

			if(Array.isArray(data)) {

				data.forEach(function (d) {

					if (d.type === 'folder') {
						scannedFolders.push(d);
					}
					else if (d.type === 'file') {
						scannedFiles.push(d);
					}

				});

			}
			else if(typeof data === 'object') {

				scannedFolders = data.folders;
				scannedFiles = data.files;

			}


			// Empty the old result and make the new one

			fileList.empty().hide();

			if(!scannedFolders.length && !scannedFiles.length) {
				filemanager.find('.nothingfound').show();
			}
			else {
				filemanager.find('.nothingfound').hide();
			}
            var columnHeader=('<div class="columns">'),
                columnFooter=('</div>');
			if(scannedFolders.length) {

				var i=1,htmlData='';


                scannedFolders.forEach(function(f) {

					var itemsLength = f.items.length,
						name = escapeHTML(f.name),
						icon = '<span class="icon folder"></span>';

					if(itemsLength) {
						icon = '<span class="icon folder full"></span>';
					}

					if(itemsLength == 1) {
						itemsLength += ' item';
					}
					else if(itemsLength > 1) {
						itemsLength += ' items';
					}
					else {
						itemsLength = 'Empty';
					}

					if(i%4==1){
                        htmlData = htmlData+columnHeader;
					    //columnHeader.appendTo(fileList);
						console.log(i+': Header');
					}

					htmlData = htmlData+('<div class="column is-3 folders">'+
                        '<a href="'
                        + f.path +'" title="'+ f.path.replace(/\.\.\//g,'') +'" class="folders">' +
                        '<div class="panel">'+
                        '<div class="is-marginless"><div class="file-icon-box file-icon-box-folder has-text-centered"><span class="fa icon fa-folder file-icon"></span></div></div>'+
                        '<div class="panel-block">'+
                        '<div class="columns">'+
                        '<div class="column">'+
                        '<div class="panel-block-item"><span class="name">' + name + '</span></div>'+
                    	'</div>'+
                    	'<div class="column has-text-right">'+
                        '<div class="panel-block-item">' + bytesToSize(f.size) + ' (' + itemsLength + ')</div>'+
                        '</div></div></div></div></a></div>');

                    //folder.appendTo(fileList);


                    if (i % 4 == 0) {
                        console.log(i+': Footer');
                        htmlData = htmlData+columnFooter;
                    }
                    else if(i==scannedFolders.length){
                        console.log(i+': Footer');
                        htmlData = htmlData+columnFooter;
                    }

					i++;
				});
                $(htmlData).appendTo(fileList);
                htmlData='';
			}

			if(scannedFiles.length) {

                var i=1,htmlData='';

                scannedFiles.forEach(function(f) {

					var fileSize = bytesToSize(f.size),
						name = escapeHTML(f.name),
						fileType = name.split('.'),
						icon = '<span class="icon file"></span>';

					fileType = fileType[fileType.length-1];

					icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';

                    if(i%4==1){
                        htmlData = htmlData+columnHeader;
                        //columnHeader.appendTo(fileList);
                        console.log(i+': Header');
                    }

                    htmlData = htmlData+('<div class="column is-3 files">'+
                        '<a href="'+ f.path+'" title="'+ f.path.replace(/\.\.\//g,'') +'" class="files">' +
                        '<div class="panel">'+
                        '<p class="is-marginless has-text-centered">'+
                    '<div class="file-icon-box file-icon-box-files file-icon-ext-'+fileType+' has-text-centered"><span class="file-icon">'+fileType+'</div>'+
                        '</p>'+
                        '<div class="panel-block">'+
                        '<div class="columns">'+
                        '<div class="column">'+
                        '<div class="panel-block-item">'+ name +'</div>'+
                        '</div>'+
                        '<div class="column has-text-right">'+
                        '<div class="panel-block-item">'+fileSize+' <i class="fa fa-calendar"></i></div>'+
                        '</div></div></div></div></a></div>');
//					htmlData = htmlData+('<li class="files"><a href="'+ f.path+'" title="'+ f.path.replace(/\.\.\//g,'') +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');

                    if (i % 4 == 0) {
                        console.log(i+': Footer');
                        htmlData = htmlData+columnFooter;
                    }
                    else if(i==scannedFolders.length){
                        console.log(i+': Footer');
                        htmlData = htmlData+columnFooter;
                    }

                    i++;

				});
                $(htmlData).appendTo(fileList);
                htmlData='';
			}


			// Generate the breadcrumbs

			var url = '';

			if(filemanager.hasClass('searching')){
				url = '<span>Search results: </span><br><span>Total: '+(data.folders.length+data.files.length)+' items found!</span>';
				fileList.removeClass('animated');

			}
			else {
				fileList.addClass('animated');

				breadcrumbsUrls.forEach(function (u, i) {
					if(u==null)
						var name = [];
						else
					var name = u.split('/');


					if (i !== breadcrumbsUrls.length - 1) {
						if(name[name.length-1]=='..' || name[name.length-1]=='.') {
                            url += '<a href="' + u + '"><span class="folderName">Parent Dir</span></a> <span class="arrow">→</span> ';
                        }
                        else{
                            url += '<a href="' + u + '"><span class="folderName">' + name[name.length - 1] + '</span></a> <span class="arrow">→</span> ';

						}
					}
					else {
						url += '<span class="folderName">' + name[name.length-1] + '</span>';
					}

				});

			}

			breadcrumbs.text('').append(url);


			// Show the generated elements

			fileList.animate({'display':'inline-block'});

		}


		// This function escapes special html characters in names

		function escapeHTML(text) {
			return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
		}


		// Convert file sizes from bytes to human readable units

		function bytesToSize(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0) return '0 Bytes';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		}

	});
});
