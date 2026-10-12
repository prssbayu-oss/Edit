/**
 * Handles and keeps track of loaded and pending fonts. A default global
 * instance of this class is created and used by loaders if not supplied
 * manually.
 *
 * In general that should be sufficient, however there are times when it can
 * be useful to have separate loaders - for example if you want to show
 * separate loading bars for heading fonts and body fonts.
 *
 * const manager = new VessertID.FontLoader();
 * manager.onLoad = () => console.log( 'Loading complete!' );
 *
 * const loader1 = new InterLoader( manager );
 * const loader2 = new PoppinsLoader( manager );
 */
class FontLoader {

	/**
	 * Constructs a new font loader.
	 *
	 * @param {Function} [onLoad] - Executes when all items have been loaded.
	 * @param {Function} [onProgress] - Executes when single items have been loaded.
	 * @param {Function} [onError] - Executes when an error occurs.
	 */
	constructor( onLoad, onProgress, onError ) {

		const scope = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let familyModifier = undefined;
		const handlers = [];

		this.onStart = undefined;
		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;

		/**
		 * @private
		 * @type {AbortController | null}
		 */
		this._abortController = null;

		/**
		 * @param {string} fontKey - The font key to load.
		 */
		this.itemStart = function ( fontKey ) {

			itemsTotal ++;

			if ( isLoading === false ) {

				if ( scope.onStart !== undefined ) {

					scope.onStart( fontKey, itemsLoaded, itemsTotal );

				}

			}

			isLoading = true;

		};

		/**
		 * @param {string} fontKey - The font key of the loaded item.
		 */
		this.itemEnd = function ( fontKey ) {

			itemsLoaded ++;

			if ( scope.onProgress !== undefined ) {

				scope.onProgress( fontKey, itemsLoaded, itemsTotal );

			}

			if ( itemsLoaded === itemsTotal ) {

				isLoading = false;

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}

		};

		/**
		 * @param {string} fontKey - The font key of the item that produces an error.
		 */
		this.itemError = function ( fontKey ) {

			if ( scope.onError !== undefined ) {

				scope.onError( fontKey );

			}

		};

		/**
		 * @param {string} fontKey - The font key to resolve.
		 * @return {string} The resolved family.
		 */
		this.resolveFamily = function ( fontKey ) {

			fontKey = fontKey.normalize( 'NFC' );

			if ( familyModifier ) {

				return familyModifier( fontKey );

			}

			return fontKey;

		};

		/**
		 * @param {function(string):string} transform - Family modifier callback.
		 * @return {FontLoader} A reference to this font loader.
		 */
		this.setFamilyModifier = function ( transform ) {

			familyModifier = transform;

			return this;

		};

		/**
		 * @param {string} regex - A regular expression.
		 * @param {Loader} loader - A loader that should handle matched cases.
		 * @return {FontLoader} A reference to this font loader.
		 */
		this.addHandler = function ( regex, loader ) {

			handlers.push( regex, loader );

			return this;

		};

		/**
		 * @param {string} regex - A regular expression.
		 * @return {FontLoader} A reference to this font loader.
		 */
		this.removeHandler = function ( regex ) {

			const index = handlers.indexOf( regex );

			if ( index !== - 1 ) {

				handlers.splice( index, 2 );

			}

			return this;

		};

		/**
		 * @param {string} file - The font key.
		 * @return {?Loader} The registered loader. Returns null if no loader was found.
		 */
		this.getHandler = function ( file ) {

			for ( let i = 0, l = handlers.length; i < l; i += 2 ) {

				const regex = handlers[ i ];
				const loader = handlers[ i + 1 ];

				if ( regex.global ) regex.lastIndex = 0;

				if ( regex.test( file ) ) {

					return loader;

				}

			}

			return null;

		};

		/**
		 * @return {FontLoader} A reference to this font loader.
		 */
		this.abort = function () {


			this.abortController.abort();
			this._abortController = null;

			return this;

		};

	}

	/**
	 * @type {AbortController}
	 */
	get abortController() {

		if ( ! this._abortController ) {

			this._abortController = new AbortController();

		}

		return this._abortController;

	}

}

/**
 * The global default font loader.
 *
 * @constant
 * @type {FontLoader}
 */
const DefaultFontLoader = /*@__PURE__*/ new FontLoader();

export { DefaultFontLoader, FontLoader };
