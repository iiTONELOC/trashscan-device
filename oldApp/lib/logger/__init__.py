import os
import logging
import lib.env_loader
from pathlib import Path

CWD = cwd = str(Path(__file__).parent.parent.parent)
BARCODE_LOG = os.environ['BARCODE_LOG']
GENERAL_LOG = os.environ['GEN_LOG']
ERROR_LOG = os.environ['ERR_LOG']

LOGS = "/logs"

GEN_LOG_LOCATION = CWD + LOGS + BARCODE_LOG
BARCODE_LOG_LOCATION = CWD + LOGS + BARCODE_LOG
ERROR_LOG_LOCATION = CWD + LOGS + ERROR_LOG

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

error_logger = logging.getLogger('ERROR')
error_log_handler = logging.FileHandler(ERROR_LOG_LOCATION)
error_log_handler.setFormatter(formatter)
error_logger.setLevel(logging.ERROR)
error_logger.addHandler(error_log_handler)
