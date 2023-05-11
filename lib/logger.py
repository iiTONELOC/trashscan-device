import os
import logging

PREFIX = '/home/trashscanner/Trash_Scan' if os.name == 'posix' else '.'
GEN_LOG_LOCATION = PREFIX + '/logs/default.log'
BARCODE_LOG_LOCATION = PREFIX + '/logs/barcode.log'
BARCODE_DATA_LOG_LOCATION = PREFIX + '/logs/data.log'

formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] >> %(message)s')


gen_logger = logging.getLogger('DEFAULT')
gen_log_handler = logging.FileHandler(GEN_LOG_LOCATION)
gen_log_handler.setFormatter(formatter)
gen_logger.setLevel(logging.INFO)
gen_logger.addHandler(gen_log_handler)

barcode_logger = logging.getLogger('BARCODE')
barcode_log_handler = logging.FileHandler(BARCODE_LOG_LOCATION)
barcode_log_handler.setFormatter(formatter)
barcode_logger.setLevel(logging.INFO)
barcode_logger.addHandler(barcode_log_handler)

barcode_data_logger = logging.getLogger('DATA')
barcode_data_log_handler = logging.FileHandler(BARCODE_DATA_LOG_LOCATION)
# barcode_data_log_handler.setFormatter(formatter)
barcode_data_logger.setLevel(logging.INFO)
barcode_data_logger.addHandler(barcode_data_log_handler)
