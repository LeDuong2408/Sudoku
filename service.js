var sudoku  = {};  // Global reference to the sudoku library

    sudoku.DIGITS = "123456789";    // Allowed sudoku.DIGITS
    var ROWS = "ABCDEFGHI";         // Row lables
    var COLS = sudoku.DIGITS;       // Column lables
    var SQUARES = null;             // Square IDs

    var UNITS = null;               // All units (row, column, or box)
    var SQUARE_UNITS_MAP = null;    // Squares -> units map
    var SQUARE_PEERS_MAP = null;    // Squares -> peers map
    
    var MIN_GIVENS = 17;            // Minimum number of givens 
    var NR_SQUARES = 81;            // Number of squares
    
    // Define difficulties by how many squares are given to the player in a new
    // puzzle.
    var DIFFICULTY = {
        "easy":         62,
        "medium":       53,
        "hard":         44,
        "very-hard":    35,
        "insane":       26,
        "inhuman":      17,
    };

    // Blank character and board representation
    sudoku.BLANK_CHAR = '.';
    sudoku.BLANK_BOARD = "...................................................."+
            ".............................";

    function initialize(){

        SQUARES             = sudoku._cross(ROWS, COLS);
        UNITS               = sudoku._get_all_units(ROWS, COLS);
        SQUARE_UNITS_MAP    = sudoku._get_square_units_map(SQUARES, UNITS);
        SQUARE_PEERS_MAP    = sudoku._get_square_peers_map(SQUARES, 
                                    SQUARE_UNITS_MAP);
    }

    generate = function(difficulty, unique){
        
        if(typeof difficulty === "string" || typeof difficulty === "undefined"){
            difficulty = DIFFICULTY[difficulty] || DIFFICULTY.easy;
        }
        
        difficulty = sudoku._force_range(difficulty, NR_SQUARES + 1, 
                MIN_GIVENS);
        
        unique = unique || true;
        
        var blank_board = "";
        for(var i = 0; i < NR_SQUARES; ++i){
            blank_board += '.';
        }
        var candidates = sudoku._get_candidates_map(blank_board);
        
        var shuffled_squares = sudoku._shuffle(SQUARES);
        for(var si in shuffled_squares){
            var square = shuffled_squares[si];
            
            var rand_candidate_idx = 
                    sudoku._rand_range(candidates[square].length);
            var rand_candidate = candidates[square][rand_candidate_idx];
            if(!sudoku._assign(candidates, square, rand_candidate)){
                break;
            }
            
            var single_candidates = [];
            for(var si in SQUARES){
                var square = SQUARES[si];
                
                if(candidates[square].length == 1){
                    single_candidates.push(candidates[square]);
                }
            }
            
            if(single_candidates.length >= difficulty && 
                    sudoku._strip_dups(single_candidates).length >= 8){
                var board = "";
                var givens_idxs = [];
                for(var i in SQUARES){
                    var square = SQUARES[i];
                    if(candidates[square].length == 1){
                        board += candidates[square];
                        givens_idxs.push(i);
                    } else {
                        board += sudoku.BLANK_CHAR;
                    }
                }
                
                var nr_givens = givens_idxs.length;
                if(nr_givens > difficulty){
                    givens_idxs = sudoku._shuffle(givens_idxs);
                    for(var i = 0; i < nr_givens - difficulty; ++i){
                        var target = parseInt(givens_idxs[i]);
                        board = board.substr(0, target) + sudoku.BLANK_CHAR + 
                            board.substr(target + 1);
                    }
                }
                
                if(sudoku.solve(board)){
                    return board;
                }
            }
        }
        
        return sudoku.generate(difficulty);
    };